import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuditLog } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkListResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuditLogService } from './audit-log.service';

@ApiTags('audit-logs')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/audit-logs')
export class ExternalAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs for the authenticated company' })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@CurrentUser() user: AuthSession): Promise<AuditLog[]> {
    return this.auditLogService.listByCompany(
      tenantContextFromSession(user),
      user.companyId!,
    );
  }
}
