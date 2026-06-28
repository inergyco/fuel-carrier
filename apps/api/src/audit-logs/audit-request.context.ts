import { Injectable } from '@nestjs/common';
import type { AuthSession } from '@fuel-carrier/shared-types';

@Injectable()
export class AuditRequestContext {
  private actor: AuthSession | null = null;
  private ipAddress: string | null = null;
  private userAgent: string | null = null;

  setRequestMeta(meta: {
    actor?: AuthSession | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): void {
    if (meta.actor !== undefined) {
      this.actor = meta.actor;
    }

    if (meta.ipAddress !== undefined) {
      this.ipAddress = meta.ipAddress;
    }

    if (meta.userAgent !== undefined) {
      this.userAgent = meta.userAgent;
    }
  }

  getActor(): AuthSession | null {
    return this.actor;
  }

  getIpAddress(): string | null {
    return this.ipAddress;
  }

  getUserAgent(): string | null {
    return this.userAgent;
  }
}
