import { z } from 'zod';

export const getAllEateriesSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(0).default(0),
  }),
});

// Schema for validating cached eatery data
// This will be validated by the scraper that sends the data, max 500 eateries for safety
export const EaterySchema = z.array(z.any()).max(500);
