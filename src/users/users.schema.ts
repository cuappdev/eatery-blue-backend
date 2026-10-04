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

export const notificationIdsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.number().int('Notification ids must be integers').positive())
      .nonempty('At least one notification id is required'),
  }),
});

export const updateSettingsSchema = z.object({
  body: z
    .strictObject({
      favoriteItemPushNotifications: z.boolean().optional(),
      cornellAppdevPushNotifications: z.boolean().optional(),
    })
    .refine(
      (body) => Object.keys(body).length > 0,
      'At least one setting is required',
    ),
});

export const favoriteEaterySchema = z.object({
  body: z.object({
    cornellId: z.number().int('cornellId must be an integer'),
  }),
});
