import { Module } from '@nestjs/common';
import { BrowserPushService } from './browser-push.service';
import { CarConditionAlertService } from './car-condition-alert.service';
import { InternalCompanyNotificationsController } from './internal-company-notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [InternalCompanyNotificationsController],
  providers: [
    NotificationsService,
    BrowserPushService,
    CarConditionAlertService,
  ],
  exports: [NotificationsService, BrowserPushService, CarConditionAlertService],
})
export class NotificationsModule {}
