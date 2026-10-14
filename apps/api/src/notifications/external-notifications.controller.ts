import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type {
  AuthSession,
  CompanyNotification,
  DeletePushSubscriptionDto,
  NotificationReadAllResult,
  NotificationUnreadCount,
  PaginatedResult,
  PushVapidPublicKey,
  SavePushSubscriptionDto,
} from '@fuel-carrier/shared-types';
import { UserRole } from '@fuel-carrier/shared-types';
import {
  deletePushSubscriptionSchema,
  savePushSubscriptionSchema,
} from '@fuel-carrier/shared-validation/notification/push-subscription';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../common/dto/pagination-query.dto';
import {
  ApiEnvelopeNotFoundResponse,
  ApiEnvelopeOkPaginatedResponse,
  ApiEnvelopeOkResponse,
  ApiEnvelopeUnauthorizedResponse,
} from '../swagger/decorators/api-envelope.decorator';
import {
  CompanyNotificationDto,
  DeletePushSubscriptionRequestDto,
  NotificationReadAllResultDto,
  NotificationUnreadCountDto,
  PushVapidPublicKeyDto,
  SavePushSubscriptionRequestDto,
} from '../swagger/dto/notification.dto';
import { AUTH_COOKIE_SCHEME } from '../swagger/swagger.constants';
import { BrowserPushService } from './browser-push.service';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiCookieAuth(AUTH_COOKIE_SCHEME)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COMPANY_USER)
@Controller('external/notifications')
export class ExternalNotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly browserPush: BrowserPushService,
  ) {}

  @Get('push/vapid-public-key')
  @ApiOperation({
    summary: 'Public VAPID key for the company app push subscription',
  })
  @ApiEnvelopeOkResponse(PushVapidPublicKeyDto)
  @ApiEnvelopeUnauthorizedResponse()
  vapidPublicKey(): PushVapidPublicKey {
    return { publicKey: this.browserPush.getPublicKey() };
  }

  @Put('push/subscription')
  @ApiOperation({
    summary: 'Save this browser so closed-app notifications can be pushed',
  })
  @ApiBody({ type: SavePushSubscriptionRequestDto })
  @ApiEnvelopeUnauthorizedResponse()
  savePushSubscription(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(savePushSubscriptionSchema))
    body: SavePushSubscriptionDto,
  ): Promise<void> {
    return this.browserPush.saveSubscription(user, body);
  }

  @Post('push/subscription/remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop push notifications for this browser' })
  @ApiBody({ type: DeletePushSubscriptionRequestDto })
  @ApiEnvelopeUnauthorizedResponse()
  removePushSubscription(
    @CurrentUser() user: AuthSession,
    @Body(new ZodValidationPipe(deletePushSubscriptionSchema))
    body: DeletePushSubscriptionDto,
  ): Promise<void> {
    return this.browserPush.removeSubscription(user, body);
  }

  @Get('unread-count')
  @ApiOperation({
    summary: 'Unread browser notifications for the current user',
  })
  @ApiEnvelopeOkResponse(NotificationUnreadCountDto)
  @ApiEnvelopeUnauthorizedResponse()
  unreadCount(
    @CurrentUser() user: AuthSession,
  ): Promise<NotificationUnreadCount> {
    return this.notificationsService.unreadCount(user);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark every unread browser notification as read' })
  @ApiEnvelopeOkResponse(NotificationReadAllResultDto)
  @ApiEnvelopeUnauthorizedResponse()
  markAllRead(
    @CurrentUser() user: AuthSession,
  ): Promise<NotificationReadAllResult> {
    return this.notificationsService.markAllRead(user);
  }

  @Get()
  @ApiOperation({ summary: 'List browser notifications for the current user' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiEnvelopeOkPaginatedResponse(CompanyNotificationDto)
  @ApiEnvelopeUnauthorizedResponse()
  list(
    @CurrentUser() user: AuthSession,
    @Query(new ZodValidationPipe(paginationQuerySchema))
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<CompanyNotification>> {
    return this.notificationsService.listInbox(user, query);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a browser notification as read' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiEnvelopeOkResponse(CompanyNotificationDto)
  @ApiEnvelopeNotFoundResponse()
  @ApiEnvelopeUnauthorizedResponse()
  markRead(
    @CurrentUser() user: AuthSession,
    @Param('id') id: string,
  ): Promise<CompanyNotification> {
    return this.notificationsService.markRead(user, id);
  }
}
