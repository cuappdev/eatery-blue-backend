import { z } from 'zod';

export const EaterySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  location: z.string(),
  // add other fields as needed:
});
