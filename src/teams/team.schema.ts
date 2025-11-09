import { z } from 'zod';

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    memberEmails: z.array(z.string().email()).min(1),
  }),
});

export const updateTeamSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    memberEmails: z.array(z.string().email()).optional(),
  }),
});

export const addTeamMembersSchema = z.object({
  body: z.object({
    memberEmails: z.array(z.string().email()).min(1),
  }),
});

export const teamParamsSchema = z.object({
  params: z.object({
    teamId: z.string().transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid team ID',
        });
        return z.NEVER;
      }
      return parsed;
    }),
  }),
});

export const courseOfferingTeamsParamsSchema = z.object({
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

export const teamMemberParamsSchema = z.object({
  params: z.object({
    teamId: z.string().transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Invalid team ID',
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
