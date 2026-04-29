import { z } from 'zod';

export const fcmTokenSchema = z.object({
  body: z.object({
    token: z.string().nonempty('FCM token is required'),
  }),
});

export const itemPreferenceSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Item name is required'),
    cornellId: z.number().int('cornellId must be an integer'),
    preference: z.enum(['liked', 'disliked', 'none']),
  }),
});

export const favoriteItemSchema = z.object({
  body: z.object({
    name: z.string().nonempty('Item name is required'),
  }),
});

export const favoriteEaterySchema = z.object({
  body: z.object({
    cornellId: z.number().int('cornellId must be an integer'),
  }),
});
