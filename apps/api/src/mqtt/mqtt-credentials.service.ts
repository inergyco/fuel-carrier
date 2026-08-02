import { HttpStatus, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type {
  CarMqttCredentials,
  TenantContext,
} from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditActions,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  fetchCompanyName,
  formatAuditCarLabel,
} from '../audit-logs/audit-log.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { mqttAcls } from '../database/schema/mqtt-acls';
import { mqttClients } from '../database/schema/mqtt-clients';
import { TenantDbService } from '../database/tenant-db.service';
import {
  generateMqttSecret,
  hashMqttSecret,
  buildMqttTelemetryTopic,
} from './mqtt-secret.utils';

@Injectable()
export class MqttCredentialsService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create or rotate MQTT credentials for a car.
   * Returns the plaintext password once — it is not stored.
   */
  async provisionForCar(
    context: TenantContext,
    carId: string,
  ): Promise<CarMqttCredentials> {
    const password = generateMqttSecret();
    const passwordHash = await hashMqttSecret(password);
    const username = carId;
    const publishTopic = buildMqttTelemetryTopic(carId);

    return this.tenantDb.run(context, async (tx) => {
      const [car] = await tx
        .select()
        .from(cars)
        .where(eq(cars.id, carId))
        .limit(1);

      if (!car) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Car not found',
        );
      }

      const [existing] = await tx
        .select({ id: mqttClients.id })
        .from(mqttClients)
        .where(eq(mqttClients.carId, carId))
        .limit(1);

      const rotated = Boolean(existing);
      let clientId = existing?.id;

      if (clientId) {
        await tx
          .update(mqttClients)
          .set({
            username,
            passwordHash,
            enabled: true,
            isSuperuser: false,
          })
          .where(eq(mqttClients.id, clientId));
        await tx.delete(mqttAcls).where(eq(mqttAcls.clientId, clientId));
      } else {
        const [created] = await tx
          .insert(mqttClients)
          .values({
            username,
            passwordHash,
            enabled: true,
            isSuperuser: false,
            carId,
          })
          .returning({ id: mqttClients.id });

        if (!created) {
          throw createApiException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ApiErrorCode.INTERNAL_ERROR,
            'Failed to create MQTT client',
          );
        }

        clientId = created.id;
      }

      await tx.insert(mqttAcls).values({
        clientId,
        topic: publishTopic,
        access: 'write',
      });

      const companyName = await fetchCompanyName(tx, car.companyId);

      await this.auditLogService.record(context, {
        action: rotated
          ? AuditActions.CAR_MQTT_CREDENTIALS_ROTATED
          : AuditActions.CAR_MQTT_CREDENTIALS_PROVISIONED,
        companyId: car.companyId,
        entityType: AuditEntityType.CAR,
        entityId: car.id,
        metadata: {
          ...buildAuditContext({
            companyName,
            entityLabel: formatAuditCarLabel(car),
          }),
          username,
        },
      });

      return {
        username,
        password,
        publishTopic,
        rotated,
      };
    });
  }
}
