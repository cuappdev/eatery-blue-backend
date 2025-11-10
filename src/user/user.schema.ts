import { z } from 'zod';

export const fcmTokenSchema = z.object({
  body: z.object({
    token: z.string().nonempty('FCM token is required'),
  }),
});
