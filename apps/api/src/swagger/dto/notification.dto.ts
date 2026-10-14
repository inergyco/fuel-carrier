import { ApiProperty } from '@nestjs/swagger';
import {
  COMPANY_USER_LEVELS,
  NOTIFICATION_CHANNELS,
} from '@fuel-carrier/shared-types';

export class NotificationCompanySummaryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Acme Logistics' })
  name!: string;
}

export class NotificationBroadcastDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440010' })
  id!: string;

  @ApiProperty({ enum: NOTIFICATION_CHANNELS, example: 'browser' })
  channel!: string;

  @ApiProperty({ example: 'Depot hours' })
  title!: string;

  @ApiProperty({ example: 'The north depot closes at 18:00 today.' })
  body!: string;

  @ApiProperty({ enum: COMPANY_USER_LEVELS, isArray: true, example: ['admin'] })
  levels!: string[];

  @ApiProperty({ type: [NotificationCompanySummaryDto] })
  companies!: NotificationCompanySummaryDto[];

  @ApiProperty({ example: 4 })
  recipientCount!: number;

  @ApiProperty({ example: '2026-10-14T10:00:00.000Z' })
  createdAt!: string;
}

export class SendNotificationRequestDto {
  @ApiProperty({ enum: NOTIFICATION_CHANNELS, example: 'browser' })
  channel!: string;

  @ApiProperty({ example: 'Depot hours' })
  title!: string;

  @ApiProperty({ example: 'The north depot closes at 18:00 today.' })
  body!: string;

  @ApiProperty({
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000'],
  })
  companyIds!: string[];

  @ApiProperty({ enum: COMPANY_USER_LEVELS, isArray: true, example: ['admin'] })
  levels!: string[];
}

export class CompanyNotificationDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440020' })
  id!: string;

  @ApiProperty({ enum: NOTIFICATION_CHANNELS, example: 'browser' })
  channel!: string;

  @ApiProperty({ example: 'Depot hours' })
  title!: string;

  @ApiProperty({ example: 'The north depot closes at 18:00 today.' })
  body!: string;

  @ApiProperty({ example: '2026-10-14T10:05:00.000Z', nullable: true })
  readAt!: string | null;

  @ApiProperty({ example: '2026-10-14T10:00:00.000Z' })
  createdAt!: string;
}

export class NotificationUnreadCountDto {
  @ApiProperty({ example: 2 })
  count!: number;
}

export class NotificationReadAllResultDto {
  @ApiProperty({ example: 2 })
  updatedCount!: number;
}

export class PushVapidPublicKeyDto {
  @ApiProperty({
    example: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFg',
  })
  publicKey!: string;
}

export class PushSubscriptionKeysDto {
  @ApiProperty()
  p256dh!: string;

  @ApiProperty()
  auth!: string;
}

export class SavePushSubscriptionRequestDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/example' })
  endpoint!: string;

  @ApiProperty({ type: PushSubscriptionKeysDto })
  keys!: PushSubscriptionKeysDto;
}

export class DeletePushSubscriptionRequestDto {
  @ApiProperty({ example: 'https://fcm.googleapis.com/fcm/send/example' })
  endpoint!: string;
}
