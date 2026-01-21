import { z } from 'zod';

export const verifyDeviceUuidSchema = z.object({
  body: z.object({
    deviceUuid: z.string().nonempty('Device UUID is required'),
  }),
});

export const refreshAccessTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().nonempty('Refresh token is required'),
  }),
});

export const linkCbordAccountSchema = z.object({
  body: z.object({
    pin: z
      .string()
      .nonempty('PIN is required')
      .regex(/^\d+$/, 'PIN must contain only numeric characters'),
    sessionId: z.string().nonempty('Session ID is required'),
  }),
});

export const getCbordSessionSchema = z.object({
  body: z.object({
    pin: z
      .string()
      .nonempty('PIN is required')
      .regex(/^\d+$/, 'PIN must contain only numeric characters'),
  }),
});
