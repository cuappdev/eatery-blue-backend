import { z } from 'zod';

export const getAllEateriesSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(0).default(0),
  }),
});

// Schema for validating cached eatery data
export const EaterySchema = z.array(z.any()); // This will be validated by the scraper that sends the data
