import { z } from 'zod';

export const semesterSchema = z.object({
  body: z.object({
    season: z.string().min(2).max(50),
    year: z.number().min(1900).max(2100),
    startDate: z.iso.datetime(),
    endDate: z.iso.datetime(),
  }),
});
