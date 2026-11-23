import type { NextFunction, Request, Response } from 'express';
import type { ZodObject } from 'zod';
import { ZodError } from 'zod';

import { ValidationError } from '../utils/AppError.js';

export const validateRequest =
  (schema: ZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If validation is successful, continue
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Format ZodError issues into a clean object
        const formattedErrors = err.issues.reduce(
          (acc, issue) => {
            const path = issue.path.join('.');
            acc[path] = issue.message;
            return acc;
          },
          {} as Record<string, string>,
        );

        const validationError = new ValidationError(
          'Request validation failed',
          formattedErrors,
        );
        return next(validationError);
      }
      next(err);
    }
  };
