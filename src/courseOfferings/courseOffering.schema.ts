import { z } from 'zod';

import { COURSE_OFFERING_ROLE_VALUES } from '../constants/roles.js';

export const createCourseOfferingSchema = z.object({
  body: z.object({
    courseId: z.number().int().positive(),
    semesterId: z.number().int().positive(),
    settings: z.record(z.string(), z.any()).optional().default({}),
  }),
});

export const updateCourseOfferingSchema = z.object({
  body: z.object({
    settings: z.record(z.string(), z.any()),
  }),
});

export const courseOfferingParamsSchema = z.object({
  params: z.object({
    offeringId: z.string().transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid offering ID',
        });
        return z.NEVER;
      }
      return parsed;
    }),
  }),
});

export const courseOfferingQuerySchema = z.object({
  query: z.object({
    role: z.enum(COURSE_OFFERING_ROLE_VALUES).optional(),
  }),
});
