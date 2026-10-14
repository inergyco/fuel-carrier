import { COMPANY_USER_LEVELS } from '@fuel-carrier/shared-types';
import {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE,
  NOTIFICATION_MAX_COMPANIES,
  NOTIFICATION_NO_MATCHING_STAFF_MESSAGE,
  NOTIFICATION_TITLE_MAX_LENGTH,
  type SendNotificationDto,
} from '@fuel-carrier/shared-types/notification';
import { z } from 'zod';

export type { SendNotificationDto };

export {
  NOTIFICATION_BODY_MAX_LENGTH,
  NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE,
  NOTIFICATION_MAX_COMPANIES,
  NOTIFICATION_NO_MATCHING_STAFF_MESSAGE,
  NOTIFICATION_TITLE_MAX_LENGTH,
};

export type SendNotificationMessages = {
  titleRequired: string;
  titleTooLong: string;
  bodyRequired: string;
  bodyTooLong: string;
  companiesRequired: string;
  companiesTooMany: string;
  levelsRequired: string;
};

export function createSendNotificationSchema(
  messages: SendNotificationMessages,
) {
  return z.object({
    channel: z.enum(NOTIFICATION_CHANNELS),
    title: z
      .string()
      .trim()
      .min(1, messages.titleRequired)
      .max(NOTIFICATION_TITLE_MAX_LENGTH, messages.titleTooLong),
    body: z
      .string()
      .trim()
      .min(1, messages.bodyRequired)
      .max(NOTIFICATION_BODY_MAX_LENGTH, messages.bodyTooLong),
    companyIds: z
      .array(z.uuid())
      .min(1, messages.companiesRequired)
      .max(NOTIFICATION_MAX_COMPANIES, messages.companiesTooMany),
    levels: z
      .array(z.enum(COMPANY_USER_LEVELS))
      .min(1, messages.levelsRequired),
  });
}

export const sendNotificationDtoSchema: z.ZodType<SendNotificationDto> =
  createSendNotificationSchema({
    titleRequired: 'Title is required',
    titleTooLong: `Title must be at most ${NOTIFICATION_TITLE_MAX_LENGTH} characters`,
    bodyRequired: 'Message is required',
    bodyTooLong: `Message must be at most ${NOTIFICATION_BODY_MAX_LENGTH} characters`,
    companiesRequired: 'Select at least one company',
    companiesTooMany: `Select at most ${NOTIFICATION_MAX_COMPANIES} companies`,
    levelsRequired: 'Select at least one access level',
  });
