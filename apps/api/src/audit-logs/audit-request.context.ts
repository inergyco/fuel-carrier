import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';

type AuditRequestStore = {
  ipAddress: string | null;
  userAgent: string | null;
};

const auditRequestStorage = new AsyncLocalStorage<AuditRequestStore>();

export function runInAuditRequestScope(
  store: AuditRequestStore,
  next: () => void,
): void {
  auditRequestStorage.run(store, next);
}

@Injectable()
export class AuditRequestContext {
  getIpAddress(): string | null {
    return auditRequestStorage.getStore()?.ipAddress ?? null;
  }

  getUserAgent(): string | null {
    return auditRequestStorage.getStore()?.userAgent ?? null;
  }
}
