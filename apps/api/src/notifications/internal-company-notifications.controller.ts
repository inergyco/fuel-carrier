import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { NotificationBroadcast } from '@fuel-carrier/shared-types/notification';
import type { PaginatedResult } from '@fuel-carrier/shared-types/pagination';
import { UserRole } from '@fuel-carrier/shared-types/user-role';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import { NotificationBroadcastDto } from '../swagger/dto/notification.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/companies/:companyId/notifications')
export class InternalCompanyNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({
    summary: 'List notifications delivered to a company',
  })
  @ApiParam({ name: 'companyId', format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(NotificationBroadcastDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @Param('companyId') companyId: string,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<NotificationBroadcast>> {
    return this.notificationsService.listByCompany(
      internalTenantContext(),
      companyId,
      query,
    );
  }
}
