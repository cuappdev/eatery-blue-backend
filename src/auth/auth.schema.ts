import { z } from 'zod';

export const authorizeDeviceIdSchema = z.object({
  body: z.object({
    deviceId: z.string().nonempty('Device ID is required'),
  }),
});
