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
