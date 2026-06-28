import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import { eq } from 'drizzle-orm';
import type { AuthSession } from '@fuel-carrier/shared-types';
import { AuditAction, UserRole } from '@fuel-carrier/shared-types';
import { parseZodDto } from '../common/validation/zod.utils';
import {
  loginDtoSchema,
  type LoginDto,
} from '@fuel-carrier/shared-validation/admin/login';
import { AuditLogService } from '../audit-logs/audit-log.service';
import { DATABASE } from '../database/database.tokens';
import type { Database } from '../database/database.types';
import { companyUsers } from '../database/schema/company-users';
import { internalTenantContext } from '../database/tenant-context.utils';
import { AuthService } from './auth.service';

@Injectable()
export class LocalCompanyStrategy extends PassportStrategy(
  LocalStrategyBase,
  'local-company',
) {
  constructor(
    private readonly authService: AuthService,
    private readonly auditLogService: AuditLogService,
    @Inject(DATABASE) private readonly db: Database,
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

    const session = await this.authService.validateCompanyUserCredentials(
      credentials.username,
      credentials.password,
    );

    if (!session) {
      const companyUser = await this.db.query.companyUsers.findFirst({
        where: eq(companyUsers.username, credentials.username),
        columns: { companyId: true },
      });

      await this.auditLogService.record(internalTenantContext(), {
        action: AuditAction.AUTH_LOGIN_FAILED,
        companyId: companyUser?.companyId ?? null,
        actor: {
          userId: null,
          role: UserRole.COMPANY_USER,
          username: credentials.username,
          displayName: credentials.username,
        },
        metadata: {
          portal: 'external',
          username: credentials.username,
        },
      });
      throw new UnauthorizedException();
    }

    return session;
  }
}
