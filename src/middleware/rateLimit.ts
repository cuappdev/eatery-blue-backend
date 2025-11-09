import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { TooManyRequestsError } from '../utils/AppError.js';

// Rate limiting per authenticated user account id
// This should be used after authentication middleware
export const userRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return `user:${req.user!.userId}`; // Assumes req.user is populated by authentication middleware
  },
  handler: (req: Request, _res: Response): void => {
    throw new TooManyRequestsError(
      'Too many requests from your account, please try again later.',
      {
        userId: req.user!.userId,
      },
    );
  },
  skip: (req: Request): boolean => {
    // Skip rate limiting for admin users
    return req.user!.isAdmin;
  },
});
