import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type {
  AuthSession,
  NotificationBroadcast,
  PaginatedResult,
  SendNotificationDto,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import { sendNotificationDtoSchema } from '@fuel-carrier/shared-validation/notification/send';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { internalTenantContext } from '../database/tenant-context.utils';
import {
  ApiEnvelopeBadRequestResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import {
  NotificationBroadcastDto,
  SendNotificationRequestDto,
} from '../swagger/dto/notification.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INTERNAL_ADMIN)
@Controller('internal/notifications')
export class InternalNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications sent to company staff' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(NotificationBroadcastDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<NotificationBroadcast>> {
    return this.notificationsService.list(internalTenantContext(user), query);
  }

  @Post()
  @ApiOperation({
    summary: 'Send a notification to staff at selected companies and levels',
  })
  @ApiBody({ type: SendNotificationRequestDto })
  @ApiEnvelopeOkResponse(NotificationBroadcastDto)
  @ApiEnvelopeBadRequestResponse()
  @ApiEnvelopeUnauthorizedResponse()
  send(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(sendNotificationDtoSchema))
    body: SendNotificationDto,
  ): Promise<NotificationBroadcast> {
    return this.notificationsService.send(internalTenantContext(user), body);
  }
}
