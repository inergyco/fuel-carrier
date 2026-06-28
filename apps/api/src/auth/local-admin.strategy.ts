import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import type { AuthSession } from '@fuel-carrier/shared-types';
import { AuditAction, UserRole } from '@fuel-carrier/shared-types';
import { parseZodDto } from '../common/validation/zod.utils';
import {
  loginDtoSchema,
  type LoginDto,
} from '@fuel-carrier/shared-validation/admin/login';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { internalTenantContext } from '../database/tenant-context.utils';
import { AuthService } from './auth.service';

@Injectable()
export class LocalAdminStrategy extends PassportStrategy(
  LocalStrategyBase,
  'local-admin',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
  ) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<AuthSession> {
    const credentials: LoginDto = parseZodDto(loginDtoSchema, {
      username,
      password,
    });

    const session = await this.authService.validateAdminCredentials(
      credentials.username,
      credentials.password,
    );

    if (!session) {
      await this.auditLogService.record(internalTenantContext(), {
        action: AuditAction.AUTH_LOGIN_FAILED,
        actor: {
          userId: null,
          role: UserRole.INTERNAL_ADMIN,
          username: credentials.username,
          displayName: credentials.username,
        },
        metadata: {
          portal: 'internal',
          username: credentials.username,
        },
      });
      throw new UnauthorizedException();
    }

    return session;
  }
}
