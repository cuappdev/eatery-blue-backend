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

export const getAuthorizeSchema = z.object({
  body: z.object({
    pin: z.string().nonempty('PIN is required'),
    sessionId: z.string().nonempty('Session ID is required'),
  }),
});

export const getRefreshSchema = z.object({
  body: z.object({
    pin: z.string().nonempty('PIN is required'),
  }),
});
