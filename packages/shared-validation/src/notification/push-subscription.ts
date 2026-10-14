import type {
  DeletePushSubscriptionDto,
  SavePushSubscriptionDto,
} from '@fuel-carrier/shared-types/notification';
import { z } from 'zod';

export type { DeletePushSubscriptionDto, SavePushSubscriptionDto };

export const savePushSubscriptionSchema: z.ZodType<SavePushSubscriptionDto> =
  z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string().min(1).max(255),
      auth: z.string().min(1).max(255),
    }),
  });

export const deletePushSubscriptionSchema: z.ZodType<DeletePushSubscriptionDto> =
  z.object({
    endpoint: z.url(),
  });
