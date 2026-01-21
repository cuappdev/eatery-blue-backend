import { z } from 'zod';

export const getFinancialsSchema = z.object({
  body: z.object({
    sessionId: z.string().nonempty('Session ID is required'),
  }),
});

