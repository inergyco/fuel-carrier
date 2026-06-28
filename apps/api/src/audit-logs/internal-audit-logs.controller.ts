import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuditLog } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkListResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuditLogService } from './audit-log.service';

@ApiTags('audit-logs')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/companies/:companyId/audit-logs')
export class InternalAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs for a company' })
  @ApiParam({ name: 'companyId', format: 'uuid' })
  @ApiEnvelopeOkListResponse(Object)
  @ApiEnvelopeUnauthorizedResponse()
  list(@Param('companyId') companyId: string): Promise<AuditLog[]> {
    return this.auditLogService.listByCompany(
      internalTenantContext(),
      companyId,
    );
  }
}
