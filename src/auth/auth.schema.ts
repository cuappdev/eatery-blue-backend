import { z } from 'zod';

export const authorizeDeviceIdSchema = z.object({
  body: z.object({
    deviceId: z.string().nonempty('Device ID is required'),
  }),
});

export const getAuthorizeSchema = z.object({
  body: z.object({
    deviceId: z.string().nonempty('Device ID is required'),
    pin: z.string().nonempty('PIN is required'),
    session_id: z.string().nonempty('Session ID is required'),
  }),
});

export const getRefreshSchema = z.object({
  body: z.object({
    deviceId: z.string().nonempty('Device ID is required'),
    pin: z.string().nonempty('PIN is required'),
  }),
});
