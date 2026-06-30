import { eq } from 'drizzle-orm';
import type {
  AuditFieldChange,
  AuditLogMetadata,
  AuthSession,
} from '@fuel-carrier/shared-types';
import { companies } from '../database/schema/companies';
import type { TenantTransaction } from '../database/tenant-db.types';

export const AUDIT_REDACTED_VALUE = '[redacted]';

const SENSITIVE_FIELDS = new Set([
  'password',
  'passwordHash',
  'currentPassword',
  'newPassword',
]);

export function buildAuditContext(options: {
  companyName?: string | null;
  entityLabel?: string | null;
}): Pick<AuditLogMetadata, 'companyName' | 'entityLabel'> {
  const context: Pick<AuditLogMetadata, 'companyName' | 'entityLabel'> = {};

  if (options.companyName) {
    context.companyName = options.companyName;
  }

  if (options.entityLabel) {
    context.entityLabel = options.entityLabel;
  }

  return context;
}

export function formatAuditPersonLabel(
  firstName: string,
  lastName: string,
  username?: string,
): string {
  const name = `${firstName} ${lastName}`.trim();

  if (username) {
    return `${name} (${username})`;
  }

  return name;
}

export function formatAuditDriverLabel(driver: {
  firstName: string;
  lastName: string;
}): string {
  return `${driver.firstName} ${driver.lastName}`.trim();
}

export function formatAuditCarLabel(car: {
  name: string | null;
  licensePlate: string;
}): string {
  if (car.name) {
    return `${car.name} (${car.licensePlate})`;
  }

  return car.licensePlate;
}

export async function fetchCompanyName(
  tx: TenantTransaction,
  companyId: string,
): Promise<string | undefined> {
  const [row] = await tx
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  return row?.name;
}

export function actorFromSession(session: AuthSession): {
  userId: string;
  role: AuthSession['role'];
  username: string;
  displayName: string;
  companyId: string | null | undefined;
} {
  return {
    userId: session.userId,
    role: session.role,
    username: session.username,
    displayName: `${session.firstName} ${session.lastName}`.trim(),
    companyId: session.companyId,
  };
}

export function sanitizeAuditValue(field: string, value: unknown): unknown {
  if (SENSITIVE_FIELDS.has(field)) {
    if (value == null || value === '') {
      return null;
    }

    return AUDIT_REDACTED_VALUE;
  }

  return value ?? null;
}

export function toAuditSnapshot<T extends Record<string, unknown>>(
  record: T,
  fields: readonly (keyof T)[],
): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  for (const field of fields) {
    const key = String(field);
    snapshot[key] = sanitizeAuditValue(key, record[field]);
  }

  return snapshot;
}

export function diffAuditChanges<T extends Record<string, unknown>>(
  before: Partial<T> | null,
  after: Partial<T> | null,
  fields: readonly (keyof T)[],
): Record<string, AuditFieldChange> {
  const changes: Record<string, AuditFieldChange> = {};

  for (const field of fields) {
    const key = String(field);
    const fromValue = sanitizeAuditValue(key, before ? before[field] : null);
    const toValue = sanitizeAuditValue(key, after ? after[field] : null);

    if (fromValue !== toValue) {
      changes[key] = { from: fromValue, to: toValue };
    }
  }

  return changes;
}

export function createAuditChanges<T extends Record<string, unknown>>(
  record: Partial<T>,
  fields: readonly (keyof T)[],
): Record<string, AuditFieldChange> {
  return diffAuditChanges(null, record, fields);
}

export function extractClientIp(request: {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
}): string | null {
  const forwarded = request.headers?.['x-forwarded-for'];

  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0]?.trim() ?? null;
  }

  if (Array.isArray(forwarded)) {
    return forwarded[0]?.split(',')[0]?.trim() ?? null;
  }

  return request.ip ?? null;
}

export function extractUserAgent(request: {
  headers?: Record<string, string | string[] | undefined>;
}): string | null {
  const userAgent = request.headers?.['user-agent'];
  return typeof userAgent === 'string' ? userAgent : null;
}
