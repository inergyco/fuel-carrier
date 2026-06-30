import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { AuditLog, PaginatedResult } from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { AuditLogDto } from '../swagger/dto/audit-log.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { AuditLogService } from './audit-log.service';

@ApiTags('audit-logs')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/audit-logs')
export class InternalPortalAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs for internal admin actions' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(AuditLogDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<AuditLog>> {
    return this.auditLogService.listInternalActions(
      internalTenantContext(),
      query,
    );
  }
}
