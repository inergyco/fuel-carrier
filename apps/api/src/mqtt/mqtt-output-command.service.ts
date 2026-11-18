import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
  type Car,
  type CarOutputAction,
  type CarOutputCommandResult,
  type TenantContext,
} from '@fuel-carrier/shared-types';
import { and, eq, isNull, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  fetchCompanyName,
  formatAuditCarLabel,
} from '../audit-logs/audit-log.utils';
import { CarsReader } from '../cars/cars-reader.service';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars.schema';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import { REDIS } from '../redis/redis.tokens';
import { MqttBrokerService } from './mqtt-broker.service';
import {
  MQTT_OUTPUT_ACK_CHANNEL,
  parseOutputAckEvent,
  serializeOutputAckEvent,
  type MqttOutputAckEvent,
} from './mqtt-output-ack.redis';
import {
  buildOutputCommandPayload,
  isOutputAckTopic,
  parseOutputAckPayload,
  toMqttDeviceIdentity,
} from './mqtt-output-command.utils';
import { buildMqttOutputCommandTopic } from './mqtt-secret.utils';

const OUTPUT_ACK_TIMEOUT_MS = 20_000;

type PendingOutputAck = {
  carId: string;
  action: CarOutputAction;
  resolve: (result: CarOutputCommandResult) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/**
 * Publishes one MQTT GPIO command from the HTTP-handling API instance, then
 * waits for the truck ACK. With `$share` telemetry subscriptions the ACK may
 * arrive on a different instance, so ACKs are mirrored over Redis.
 */
@Injectable()
export class MqttOutputCommandService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttOutputCommandService.name);
  private readonly pendingByCommandId = new Map<number, PendingOutputAck>();
  private ackSubscriber: Redis | null = null;

  constructor(
    private readonly broker: MqttBrokerService,
    private readonly tenantDb: TenantDbService,
    private readonly carsReader: CarsReader,
    private readonly auditLogService: AuditLogService,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  async onModuleInit(): Promise<void> {
    this.broker.addMessageHandler((topic, payload) => {
      void this._handleBrokerMessage(topic, payload);
    });

    this.ackSubscriber = this.redis.duplicate();
    this.ackSubscriber.on('message', (channel, message) => {
      if (channel !== MQTT_OUTPUT_ACK_CHANNEL) {
        return;
      }
      this._resolveFromAckEvent(parseOutputAckEvent(message));
    });
    await this.ackSubscriber.subscribe(MQTT_OUTPUT_ACK_CHANNEL);
    this.logger.log(`Subscribed to Redis channel ${MQTT_OUTPUT_ACK_CHANNEL}`);
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.ackSubscriber) {
      return;
    }

    await this.ackSubscriber.quit();
    this.ackSubscriber = null;
  }

  /**
   * Backfill empty firmware identity fields from telemetry.
   * Never overwrites values already set on the car.
   */
  async rememberDeviceIdentity(
    carId: string,
    identity: { companyCode?: string; deviceId?: string },
  ): Promise<void> {
    const companyCode = identity.companyCode?.trim();
    const deviceId = identity.deviceId?.trim();
    if (!companyCode && !deviceId) {
      return;
    }

    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      // One UPDATE: fill only null columns (never overwrite set IDs).
      await tx
        .update(cars)
        .set({
          ...(companyCode
            ? {
                firmwareCompanyId: sql`coalesce(${cars.firmwareCompanyId}, ${companyCode})`,
              }
            : {}),
          ...(deviceId
            ? {
                firmwareDeviceId: sql`coalesce(${cars.firmwareDeviceId}, ${deviceId})`,
              }
            : {}),
        })
        .where(and(eq(cars.id, carId), isNull(cars.deletedAt)));
    });
  }

  /**
   * Publish a single enable/disable GPIO command and wait for the truck's
   * output-ack (locally or via Redis from another API instance).
   */
  async sendOutputCommand(
    context: TenantContext,
    carId: string,
    action: CarOutputAction,
  ): Promise<CarOutputCommandResult> {
    const car: Car = await this.tenantDb.run(context, (tx) =>
      this.carsReader.getById(tx, carId),
    );

    const identity = toMqttDeviceIdentity(car);
    if (!identity) {
      throw createApiException(
        HttpStatus.CONFLICT,
        ApiErrorCode.CONFLICT,
        'Firmware company/device IDs are not set — add them on the vehicle, or wait for telemetry',
        [{ field: 'firmwareIdentity', message: 'required' }],
      );
    }

    if (!this.broker.isConnected) {
      throw createApiException(
        HttpStatus.SERVICE_UNAVAILABLE,
        ApiErrorCode.INTERNAL_ERROR,
        'MQTT broker is not connected',
      );
    }

    const payload = buildOutputCommandPayload({ identity, action });
    const commandId = payload.command.commandId;
    const topic = buildMqttOutputCommandTopic(carId);
    const body = JSON.stringify(payload);

    const ackPromise = this._waitForAck({ carId, action, commandId });

    try {
      // Only this HTTP-handling instance publishes — one MQTT signal.
      await this.broker.publish(topic, body, { qos: 2 });
    } catch (error) {
      this._cancelPending(commandId);
      this.logger.error(
        `Failed to publish output command ${commandId} for car ${carId}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw createApiException(
        HttpStatus.BAD_GATEWAY,
        ApiErrorCode.INTERNAL_ERROR,
        'Failed to publish output command to MQTT broker',
      );
    }

    let result: CarOutputCommandResult;
    try {
      result = await ackPromise;
    } catch {
      throw createApiException(
        HttpStatus.GATEWAY_TIMEOUT,
        ApiErrorCode.INTERNAL_ERROR,
        'Timed out waiting for truck output acknowledgement',
      );
    }

    if (!result.success) {
      throw createApiException(
        HttpStatus.CONFLICT,
        ApiErrorCode.CONFLICT,
        result.message || 'Truck rejected the output command',
      );
    }

    const companyName = await this.tenantDb.run(context, (tx) =>
      fetchCompanyName(tx, car.companyId),
    );

    await this.auditLogService.record(context, {
      action:
        action === 'enable'
          ? AuditActions.CAR_OUTPUT_ENABLED
          : AuditActions.CAR_OUTPUT_DISABLED,
      companyId: car.companyId,
      entityType: AuditEntityType.CAR,
      entityId: car.id,
      metadata: {
        ...buildAuditContext({
          companyName,
          entityLabel: formatAuditCarLabel(car),
        }),
        snapshot: {
          commandId,
          action,
          message: result.message,
        },
      },
    });

    return result;
  }

  private _waitForAck(options: {
    carId: string;
    action: CarOutputAction;
    commandId: number;
  }): Promise<CarOutputCommandResult> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingByCommandId.delete(options.commandId);
        reject(new Error('output ack timeout'));
      }, OUTPUT_ACK_TIMEOUT_MS);

      this.pendingByCommandId.set(options.commandId, {
        carId: options.carId,
        action: options.action,
        resolve,
        reject,
        timer,
      });
    });
  }

  private _cancelPending(commandId: number): void {
    const pending = this.pendingByCommandId.get(commandId);
    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pendingByCommandId.delete(commandId);
    pending.reject(new Error('output command cancelled'));
  }

  private async _handleBrokerMessage(
    topic: string,
    payload: Buffer,
  ): Promise<void> {
    if (!isOutputAckTopic(topic)) {
      return;
    }

    const ack = parseOutputAckPayload(topic, payload);
    if (!ack) {
      this.logger.debug(`Ignoring invalid output-ack on ${topic}`);
      return;
    }

    const event: MqttOutputAckEvent = { ...ack };

    // Resolve locally if this instance is waiting, then mirror for peers.
    this._resolveFromAckEvent(event);

    try {
      await this.redis.publish(
        MQTT_OUTPUT_ACK_CHANNEL,
        serializeOutputAckEvent(event),
      );
    } catch (error) {
      this.logger.error(
        `Failed to fan-out output-ack commandId=${event.commandId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private _resolveFromAckEvent(event: MqttOutputAckEvent | null): void {
    if (!event) {
      return;
    }

    const pending = this.pendingByCommandId.get(event.commandId);
    if (!pending) {
      return;
    }

    if (pending.carId !== event.carId) {
      this.logger.warn(
        `Ignoring output-ack commandId=${event.commandId}: car mismatch`,
      );
      return;
    }

    clearTimeout(pending.timer);
    this.pendingByCommandId.delete(event.commandId);
    pending.resolve(event);
  }
}
