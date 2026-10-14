import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuditLog, PaginatedResult } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MustChangePasswordGuard } from '../auth/must-change-password.guard';
import { CompanyUserAdminGuard } from '../auth/company-user-admin.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { AuthSession } from '../auth/auth.types';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { tenantContextFromSession } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuditLogDto } from '../swagger/dto/audit-log.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuditLogService } from './audit-log.service';
import {
  auditLogsListQuerySchema,
  type AuditLogsListQueryDto,
} from './audit-logs-list-query.dto';
import { toAuditLogListQuery } from './to-audit-log-list-query';

@ApiTags('audit-logs')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard, MustChangePasswordGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/audit-logs')
export class ExternalAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(CompanyUserAdminGuard)
  @ApiOperation({ summary: 'List audit logs for the authenticated company' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description:
      'Action, actor username, national ID, first name, or last name',
  })
  @ApiQuery({
    name: 'start',
    required: false,
    type: String,
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'end',
    required: false,
    type: String,
    example: '2026-01-31T23:59:59.999Z',
  })
  @ApiEnvelopeOkPaginatedResponse(AuditLogDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(auditLogsListQuerySchema))
    query: AuditLogsListQueryDto,
  ): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogService.listByCompany(
      tenantContextFromSession(user),
      user.companyId!,
      toAuditLogListQuery(query),
    );
  }
}
