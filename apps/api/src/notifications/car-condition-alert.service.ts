import { Injectable, Logger } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { TankResistanceReadings } from '@fuel-carrier/shared-types/car-telemetry';
import { COMPANY_USER_LEVELS } from '@fuel-carrier/shared-types/company-user-level';
import { NotificationChannels } from '@fuel-carrier/shared-types/notification';
import {
  POSTGRES_UNIQUE_VIOLATION,
  getPostgresError,
} from '../database/postgres-error.utils';
import { carConditionAlerts } from '../database/schema/notifications.schema';
import { internalTenantContext } from '../database/tenant-context.utils';
import { TenantDbService } from '../database/tenant-db.service';
import {
  CarConditionAlertKinds,
  type CarConditionAlertKind,
} from './car-condition-alert.kinds';
import {
  buildLowFuelAlertMessage,
  buildResistanceAlertMessage,
  isLowFuel,
  listHighResistanceProbes,
  type ConditionAlertMessage,
} from './car-condition-alert.utils';
import { NotificationsService } from './notifications.service';

export type EvaluateCarConditionAlertsInput = {
  carId: string;
  companyId: string;
  licensePlate: string;
  resistance?: TankResistanceReadings;
  remainFuel?: number;
};

@Injectable()
export class CarConditionAlertService {
  private readonly logger = new Logger(CarConditionAlertService.name);

  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly notifications: NotificationsService,
  ) {}

  /**
   * Open or clear condition alerts after a telemetry sample.
   * A missing reading leaves that condition alone.
   * Failures are logged and never thrown — telemetry ingest must keep succeeding.
   */
  async evaluateAfterTelemetry(
    input: EvaluateCarConditionAlertsInput,
  ): Promise<void> {
    try {
      await this.evaluate(input);
    } catch (error) {
      this.logger.error(
        `Failed condition alert evaluation for car ${input.carId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private async evaluate(
    input: EvaluateCarConditionAlertsInput,
  ): Promise<void> {
    if (input.resistance != null) {
      const probes = listHighResistanceProbes(input.resistance);
      await this.syncEpisode({
        carId: input.carId,
        companyId: input.companyId,
        licensePlate: input.licensePlate,
        kind: CarConditionAlertKinds.HIGH_RESISTANCE,
        active: probes.length > 0,
        message:
          probes.length > 0
            ? buildResistanceAlertMessage({
                licensePlate: input.licensePlate,
                probes,
              })
            : null,
      });
    }

    if (input.remainFuel != null && Number.isFinite(input.remainFuel)) {
      const isLow = isLowFuel(input.remainFuel);
      await this.syncEpisode({
        carId: input.carId,
        companyId: input.companyId,
        licensePlate: input.licensePlate,
        kind: CarConditionAlertKinds.LOW_FUEL,
        active: isLow,
        message: isLow
          ? buildLowFuelAlertMessage({
              licensePlate: input.licensePlate,
              remainFuel: input.remainFuel,
            })
          : null,
      });
    }
  }

  private async syncEpisode(input: SyncEpisodeInput): Promise<void> {
    try {
      if (!input.active) {
        await this.deleteEpisode(input.carId, input.kind);
        return;
      }

      if (input.message == null) {
        return;
      }

      const context = internalTenantContext();
      const alreadyOpen = await this.tenantDb.run(context, async (tx) => {
        const [open] = await tx
          .select({ id: carConditionAlerts.id })
          .from(carConditionAlerts)
          .where(
            and(
              eq(carConditionAlerts.carId, input.carId),
              eq(carConditionAlerts.kind, input.kind),
            ),
          )
          .limit(1);

        return open != null;
      });

      if (alreadyOpen) {
        return;
      }

      const delivered = await this.notifications.deliverAutomatedBrowser({
        companyId: input.companyId,
        title: input.message.title,
        body: input.message.body,
        pushTitle: input.message.pushTitle,
        carId: input.carId,
        licensePlate: input.licensePlate,
        levels: [...COMPANY_USER_LEVELS],
        channel: NotificationChannels.BROWSER,
        afterInsert: async (tx, notificationId) => {
          await tx.insert(carConditionAlerts).values({
            carId: input.carId,
            companyId: input.companyId,
            notificationId,
            kind: input.kind,
          });
        },
      });

      if (!delivered) {
        this.logger.warn(
          `Skipped ${input.kind} alert for car ${input.carId}: no matching company staff`,
        );
      }
    } catch (error) {
      if (isOpenAlertUniqueViolation(error)) {
        return;
      }

      throw error;
    }
  }

  private async deleteEpisode(
    carId: string,
    kind: CarConditionAlertKind,
  ): Promise<void> {
    await this.tenantDb.run(internalTenantContext(), async (tx) => {
      await tx
        .delete(carConditionAlerts)
        .where(
          and(
            eq(carConditionAlerts.carId, carId),
            eq(carConditionAlerts.kind, kind),
          ),
        );
    });
  }
}

type SyncEpisodeInput = {
  carId: string;
  companyId: string;
  licensePlate: string;
  kind: CarConditionAlertKind;
  active: boolean;
  message: ConditionAlertMessage | null;
};

function isOpenAlertUniqueViolation(error: unknown): boolean {
  const pg = getPostgresError(error);
  return (
    pg?.code === POSTGRES_UNIQUE_VIOLATION &&
    pg.constraint === 'car_condition_alerts_car_kind_uidx'
  );
}
