import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
  type Car,
  type CarFuelConfig,
  type CarFuelConfigCommandResult,
  type CarPricing,
  type TenantContext,
} from '@fuel-carrier/shared-types';
import Redis from 'ioredis';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  fetchCompanyName,
  formatAuditCarLabel,
} from '../audit-logs/audit-log.utils';
import { CarsReader } from '../cars/cars-reader.service';
import { createApiException } from '../common/exceptions/api.exception';
import { TenantDbService } from '../database/tenant-db.service';
import { REDIS } from '../redis/redis.tokens';
import { MqttAckCommandService } from './mqtt-ack-command.service';
import { MqttBrokerService } from './mqtt-broker.service';
import {
  MQTT_FUEL_CONFIG_ACK_CHANNEL,
  parseFuelConfigAckEvent,
  type MqttFuelConfigAckEvent,
} from './mqtt-fuel-config-ack.redis';
import {
  buildFuelConfigCommandPayload,
  isFuelConfigAckTopic,
  parseFuelConfigAckPayload,
  toCarFuelConfig,
} from './mqtt-fuel-config-command.utils';
import {
  toMqttDeviceIdentity,
  type MqttDeviceIdentity,
} from './mqtt-output-command.utils';
import { buildMqttFuelConfigCommandTopic } from './mqtt-secret.utils';

type PreparedFuelConfigCommand = {
  context: TenantContext;
  car: Car;
  identity: MqttDeviceIdentity;
  fuelConfig: CarFuelConfig;
};

/**
 * Publishes one MQTT `setFuelConfig` command from the HTTP-handling API
 * instance, then waits for the truck ACK.
 */
@Injectable()
export class MqttFuelConfigCommandService extends MqttAckCommandService<MqttFuelConfigAckEvent> {
  constructor(
    broker: MqttBrokerService,
    private readonly tenantDb: TenantDbService,
    private readonly carsReader: CarsReader,
    private readonly auditLogService: AuditLogService,
    @Inject(REDIS) redis: Redis,
  ) {
    super(broker, redis, {
      channel: MQTT_FUEL_CONFIG_ACK_CHANNEL,
      timeoutMessage: 'fuel-config ack timeout',
      cancelledMessage: 'fuel-config command cancelled',
      label: 'fuel-config-ack',
      isAckTopic: isFuelConfigAckTopic,
      parseAck: parseFuelConfigAckPayload,
      parseEvent: parseFuelConfigAckEvent,
    });
  }

  /**
   * Resolve the truck command once: firmware identity, numeric ranges, and
   * broker connectivity. Call this before the pricing row is stored.
   */
  async prepareFuelConfig(options: {
    context: TenantContext;
    carId: string;
    pricing: CarPricing;
  }): Promise<PreparedFuelConfigCommand> {
    const prepared = await this._prepareFuelConfig(options);
    this.assertBrokerConnected();
    return { context: options.context, ...prepared };
  }

  /**
   * Publish an already prepared `setFuelConfig` and wait for
   * `telemetry/<uuid>/fuel-config-ack`.
   */
  async publishFuelConfig(
    command: PreparedFuelConfigCommand,
  ): Promise<CarFuelConfigCommandResult> {
    const { context, car, identity, fuelConfig } = command;
    const payload = buildFuelConfigCommandPayload({
      identity,
      fuelConfig,
    });
    const commandId = payload.command.commandId;
    const topic = buildMqttFuelConfigCommandTopic(car.id);
    const body = JSON.stringify(payload);

    const ackPromise = this.waitForAck({ carId: car.id, commandId });

    try {
      await this.broker.publish(topic, body, { qos: 2 });
    } catch (error) {
      this.cancelPending(commandId);
      this.logger.error(
        `Failed to publish fuel-config command ${commandId} for car ${car.id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw createApiException(
        HttpStatus.BAD_GATEWAY,
        ApiErrorCode.INTERNAL_ERROR,
        'Failed to publish fuel-config command to MQTT broker',
      );
    }

    let result: CarFuelConfigCommandResult;
    try {
      result = await ackPromise;
    } catch {
      throw createApiException(
        HttpStatus.GATEWAY_TIMEOUT,
        ApiErrorCode.INTERNAL_ERROR,
        'Timed out waiting for truck fuel-config acknowledgement',
      );
    }

    if (!result.success) {
      throw createApiException(
        HttpStatus.CONFLICT,
        ApiErrorCode.CONFLICT,
        result.message || 'Truck rejected the fuel-config command',
      );
    }

    const companyName = await this.tenantDb.run(context, (tx) =>
      fetchCompanyName(tx, car.companyId),
    );

    await this.auditLogService.record(context, {
      action: AuditActions.CAR_FUEL_CONFIG_SENT,
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
          pricePerLiter: fuelConfig.pricePerLiter,
          wage: fuelConfig.wage,
          volumeThresholdLiters: fuelConfig.volumeThresholdLiters,
          message: result.message,
        },
      },
    });

    return result;
  }

  private async _prepareFuelConfig(options: {
    context: TenantContext;
    carId: string;
    pricing: CarPricing;
  }): Promise<{
    car: Car;
    identity: MqttDeviceIdentity;
    fuelConfig: CarFuelConfig;
  }> {
    const car = await this.tenantDb.run(options.context, (tx) =>
      this.carsReader.getById(tx, options.carId),
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

    const mapped = toCarFuelConfig(options.pricing);
    if (!('fuelConfig' in mapped)) {
      throw createApiException(
        HttpStatus.BAD_REQUEST,
        ApiErrorCode.VALIDATION_ERROR,
        'Fuel price cannot be sent to the truck',
        mapped.fields,
      );
    }

    return { car, identity, fuelConfig: mapped.fuelConfig };
  }
}
