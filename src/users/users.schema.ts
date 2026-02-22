import { z } from 'zod';

export const fcmTokenSchema = z.object({
  body: z.object({
    token: z.string().nonempty('FCM token is required'),
  }),
});

export const favoriteItemSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Item name is required'),
  }),
});

export const favoriteEaterySchema = z.object({
  body: z.object({
    eateryId: z.number().int().positive('eateryId must be a positive integer'),
  }),
});
