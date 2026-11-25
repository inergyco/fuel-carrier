import { HttpStatus, Inject, Injectable } from '@nestjs/common';
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
import { MqttAckCommandService } from './mqtt-ack-command.service';
import { MqttBrokerService } from './mqtt-broker.service';
import {
  MQTT_OUTPUT_ACK_CHANNEL,
  parseOutputAckEvent,
  type MqttOutputAckEvent,
} from './mqtt-output-ack.redis';
import {
  buildOutputCommandPayload,
  isOutputAckTopic,
  parseOutputAckPayload,
  toMqttDeviceIdentity,
} from './mqtt-output-command.utils';
import { buildMqttOutputCommandTopic } from './mqtt-secret.utils';

/**
 * Publishes one MQTT GPIO command from the HTTP-handling API instance, then
 * waits for the truck ACK.
 */
@Injectable()
export class MqttOutputCommandService extends MqttAckCommandService<MqttOutputAckEvent> {
  constructor(
    broker: MqttBrokerService,
    private readonly tenantDb: TenantDbService,
    private readonly carsReader: CarsReader,
    private readonly auditLogService: AuditLogService,
    @Inject(REDIS) redis: Redis,
  ) {
    super(broker, redis, {
      channel: MQTT_OUTPUT_ACK_CHANNEL,
      timeoutMessage: 'output ack timeout',
      cancelledMessage: 'output command cancelled',
      label: 'output-ack',
      isAckTopic: isOutputAckTopic,
      parseAck: parseOutputAckPayload,
      parseEvent: parseOutputAckEvent,
    });
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

    this.assertBrokerConnected();

    const payload = buildOutputCommandPayload({ identity, action });
    const commandId = payload.command.commandId;
    const topic = buildMqttOutputCommandTopic(carId);
    const body = JSON.stringify(payload);

    const ackPromise = this.waitForAck({ carId, commandId });

    try {
      // Only this HTTP-handling instance publishes — one MQTT signal.
      await this.broker.publish(topic, body, { qos: 2 });
    } catch (error) {
      this.cancelPending(commandId);
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
}
