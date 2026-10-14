import { Module } from '@nestjs/common';
import { BrowserPushService } from './browser-push.service';
import { NotificationsService } from './notifications.service';

@Module({
  providers: [NotificationsService, BrowserPushService],
  exports: [NotificationsService, BrowserPushService],
})
export class NotificationsModule {}
