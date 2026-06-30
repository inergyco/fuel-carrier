import type { UserRole } from './user-role';

export const AuditAction = {
  COMPANY_CREATED: 'company.created',
  COMPANY_UPDATED: 'company.updated',
  COMPANY_DELETED: 'company.deleted',
  COMPANY_USER_CREATED: 'company_user.created',
  COMPANY_USER_UPDATED: 'company_user.updated',
  COMPANY_USER_DELETED: 'company_user.deleted',
  DRIVER_CREATED: 'driver.created',
  DRIVER_UPDATED: 'driver.updated',
  DRIVER_DELETED: 'driver.deleted',
  CAR_CREATED: 'car.created',
  CAR_UPDATED: 'car.updated',
  CAR_DELETED: 'car.deleted',
  AUTH_LOGIN_SUCCEEDED: 'auth.login_succeeded',
  AUTH_LOGIN_FAILED: 'auth.login_failed',
  AUTH_LOGOUT: 'auth.logout',
  AUTH_PASSWORD_CHANGED: 'auth.password_changed',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const AuditEntityType = {
  COMPANY: 'company',
  COMPANY_USER: 'company_user',
  DRIVER: 'driver',
  CAR: 'car',
} as const;

export type AuditEntityType =
  (typeof AuditEntityType)[keyof typeof AuditEntityType];

export type AuditFieldChange = {
  from: unknown;
  to: unknown;
};

export type AuditLogMetadata = {
  changes?: Record<string, AuditFieldChange>;
  snapshot?: Record<string, unknown>;
  portal?: 'internal' | 'external';
  username?: string;
  companyName?: string;
  entityLabel?: string;
};

export type AuditLog = {
  id: string;
  companyId: string | null;
  actorUserId: string | null;
  actorRole: UserRole | string;
  actorUsername: string;
  actorDisplayName: string;
  action: AuditAction | string;
  entityType: AuditEntityType | string | null;
  entityId: string | null;
  metadata: AuditLogMetadata;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
};

export type AuditActor = {
  userId: string | null;
  role: UserRole | string;
  username: string;
  displayName: string;
  companyId?: string | null;
};
