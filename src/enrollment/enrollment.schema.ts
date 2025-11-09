import { z } from 'zod';

import { COURSE_OFFERING_ROLE_VALUES } from '../constants/roles.js';

export const createEnrollmentsSchema = z.object({
  body: z.object({
    enrollments: z
      .array(
        z.object({
          email: z.string().email(),
          role: z.enum(COURSE_OFFERING_ROLE_VALUES),
        }),
      )
      .min(1),
  }),
});

export const updateEnrollmentSchema = z.object({
  body: z.object({
    role: z.enum(COURSE_OFFERING_ROLE_VALUES),
  }),
});

export const enrollmentParamsSchema = z.object({
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
    userId: z.string().transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid user ID',
        });
        return z.NEVER;
      }
      return parsed;
    }),
  }),
});
