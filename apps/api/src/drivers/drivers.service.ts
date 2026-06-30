import { HttpStatus, Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { Driver, TenantContext } from '@fuel-carrier/shared-types';
import {
  ApiErrorCode,
  AuditAction,
  AuditEntityType,
} from '@fuel-carrier/shared-types';
import { AuditLogService } from '../audit-logs/audit-log.service';
import {
  buildAuditContext,
  createAuditChanges,
  diffAuditChanges,
  fetchCompanyName,
  formatAuditDriverLabel,
  toAuditSnapshot,
} from '../audit-logs/audit-log.utils';
import { createApiException } from '../common/exceptions/api.exception';
import { cars } from '../database/schema/cars';
import { drivers } from '../database/schema/drivers';
import {
  POSTGRES_FOREIGN_KEY_VIOLATION,
  POSTGRES_UNIQUE_VIOLATION,
  type PostgresConstraintMapping,
  rethrowPostgresError,
} from '../database/postgres-error.utils';
import { TenantDbService } from '../database/tenant-db.service';

type CreateDriverPayload = {
  firstName: string;
  lastName: string;
  nationalId: string;
  companyId: string;
};

type UpdateDriverPayload = Partial<CreateDriverPayload>;

const DRIVER_POSTGRES_MAPPINGS: PostgresConstraintMapping[] = [
  {
    code: POSTGRES_UNIQUE_VIOLATION,
    constraint: 'drivers_national_id_unique',
    field: 'nationalId',
    message: 'A driver with this national ID already exists',
  },
  {
    code: POSTGRES_FOREIGN_KEY_VIOLATION,
    constraint: 'drivers_company_id_companies_id_fk',
    field: 'companyId',
    message: 'Company not found',
  },
];

@Injectable()
export class DriversService {
  constructor(
    private readonly tenantDb: TenantDbService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async list(context: TenantContext): Promise<Driver[]> {
    return this.tenantDb.run(context, async (tx) => {
      const rows = await tx.query.drivers.findMany({
        with: { car: true },
        orderBy: desc(drivers.createdAt),
      });

      return rows.map(_mapDriverWithCar);
    });
  }

  async getById(context: TenantContext, id: string): Promise<Driver> {
    return this.tenantDb.run(context, async (tx) => {
      const row = await tx.query.drivers.findFirst({
        where: eq(drivers.id, id),
        with: { car: true },
      });

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      return _mapDriverWithCar(row);
    });
  }

  async create(
    context: TenantContext,
    dto: CreateDriverPayload,
  ): Promise<Driver> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        const [row] = await tx.insert(drivers).values(dto).returning();

        if (!row) {
          throw createApiException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ApiErrorCode.INTERNAL_ERROR,
            'Failed to create driver',
          );
        }

        const driver = _mapDriver(row);
        const companyName = await fetchCompanyName(tx, driver.companyId);

        await this.auditLogService.record(context, {
          action: AuditAction.DRIVER_CREATED,
          companyId: driver.companyId,
          entityType: AuditEntityType.DRIVER,
          entityId: driver.id,
          metadata: {
            ...buildAuditContext({
              companyName,
              entityLabel: formatAuditDriverLabel(driver),
            }),
            changes: createAuditChanges(driver, DRIVER_AUDIT_FIELDS),
          },
        });

        return driver;
      });
    } catch (error) {
      rethrowPostgresError(error, DRIVER_POSTGRES_MAPPINGS);
    }
  }

  async update(
    context: TenantContext,
    id: string,
    dto: UpdateDriverPayload,
  ): Promise<Driver> {
    try {
      return await this.tenantDb.run(context, async (tx) => {
        const [existing] = await tx
          .select()
          .from(drivers)
          .where(eq(drivers.id, id))
          .limit(1);

        if (!existing) {
          throw createApiException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NOT_FOUND,
            'Driver not found',
          );
        }

        const [row] = await tx
          .update(drivers)
          .set(dto)
          .where(eq(drivers.id, id))
          .returning();

        if (!row) {
          throw createApiException(
            HttpStatus.NOT_FOUND,
            ApiErrorCode.NOT_FOUND,
            'Driver not found',
          );
        }

        const driver = _mapDriver(row);
        const companyName = await fetchCompanyName(tx, driver.companyId);

        await this.auditLogService.record(context, {
          action: AuditAction.DRIVER_UPDATED,
          companyId: driver.companyId,
          entityType: AuditEntityType.DRIVER,
          entityId: driver.id,
          metadata: {
            ...buildAuditContext({
              companyName,
              entityLabel: formatAuditDriverLabel(driver),
            }),
            changes: diffAuditChanges(
              _mapDriver(existing),
              driver,
              DRIVER_AUDIT_FIELDS,
            ),
          },
        });

        return driver;
      });
    } catch (error) {
      rethrowPostgresError(error, DRIVER_POSTGRES_MAPPINGS);
    }
  }

  async delete(context: TenantContext, id: string): Promise<null> {
    return this.tenantDb.run(context, async (tx) => {
      const [existing] = await tx
        .select()
        .from(drivers)
        .where(eq(drivers.id, id))
        .limit(1);

      if (!existing) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      const [row] = await tx
        .delete(drivers)
        .where(eq(drivers.id, id))
        .returning({ id: drivers.id });

      if (!row) {
        throw createApiException(
          HttpStatus.NOT_FOUND,
          ApiErrorCode.NOT_FOUND,
          'Driver not found',
        );
      }

      const deletedDriver = _mapDriver(existing);
      const companyName = await fetchCompanyName(tx, existing.companyId);

      await this.auditLogService.record(context, {
        action: AuditAction.DRIVER_DELETED,
        companyId: existing.companyId,
        entityType: AuditEntityType.DRIVER,
        entityId: id,
        metadata: {
          ...buildAuditContext({
            companyName,
            entityLabel: formatAuditDriverLabel(deletedDriver),
          }),
          snapshot: toAuditSnapshot(deletedDriver, DRIVER_AUDIT_FIELDS),
        },
      });

      return null;
    });
  }
}

type DriverWithCar = typeof drivers.$inferSelect & {
  car: typeof cars.$inferSelect | null;
};

function _mapDriver(row: typeof drivers.$inferSelect): Driver {
  return row;
}

function _mapDriverWithCar(row: DriverWithCar): Driver {
  return {
    ..._mapDriver(row),
    car: row.car,
  };
}

const DRIVER_AUDIT_FIELDS = [
  'firstName',
  'lastName',
  'nationalId',
] as const satisfies readonly (keyof Driver)[];
