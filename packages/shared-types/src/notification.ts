import type { CompanyUserLevel } from "./company-user-level";

/** Delivery channels. Add a value here when a new channel is implemented. */
export const NotificationChannels = {
  BROWSER: "browser",
} as const;

export type NotificationChannel =
  (typeof NotificationChannels)[keyof typeof NotificationChannels];

export const NOTIFICATION_CHANNELS = [NotificationChannels.BROWSER] as const;

export const NOTIFICATION_TITLE_MAX_LENGTH = 120;
export const NOTIFICATION_BODY_MAX_LENGTH = 2000;
export const NOTIFICATION_MAX_COMPANIES = 100;

/** API field error when a selected company is missing or soft-deleted. */
export const NOTIFICATION_COMPANIES_NOT_FOUND_MESSAGE =
  "One or more companies were not found";

/** API field error when any selected company has no staff at the chosen levels. */
export const NOTIFICATION_NO_MATCHING_STAFF_MESSAGE = "No matching staff";

export function readNoMatchingStaffCompanyName(message: string): string | null {
  const prefix = `${NOTIFICATION_NO_MATCHING_STAFF_MESSAGE}:`;
  if (!message.startsWith(prefix)) {
    return null;
  }

  const companyName = message.slice(prefix.length);
  return companyName.length > 0 ? companyName : null;
}

/** Body for POST internal/notifications. */
export type SendNotificationDto = {
  channel: NotificationChannel;
  title: string;
  body: string;
  companyIds: string[];
  levels: CompanyUserLevel[];
};

export type NotificationCompanySummary = {
  id: string;
  name: string;
};

/** A message an internal admin sent to company staff. */
export type NotificationBroadcast = {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  levels: CompanyUserLevel[];
  companies: NotificationCompanySummary[];
  recipientCount: number;
  createdAt: string;
};

/** One staff member's copy of a browser notification in the company app. */
export type CompanyNotification = {
  id: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export type NotificationUnreadCount = {
  count: number;
};

export type NotificationReadAllResult = {
  updatedCount: number;
};

/** Browser Push API subscription saved for one device. */
export type SavePushSubscriptionDto = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type DeletePushSubscriptionDto = {
  endpoint: string;
};

export type PushVapidPublicKey = {
  publicKey: string;
};

/** Payload the API encrypts into a Web Push. The service worker displays it. */
export type BrowserPushPayload = {
  title: string;
  body: string;
  tag: string;
};
