import { z } from 'zod';

export const getAllEateriesSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(0).default(0),
  }),
});
