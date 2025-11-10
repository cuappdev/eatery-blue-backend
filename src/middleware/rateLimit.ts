import type { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { TooManyRequestsError } from '../utils/AppError.js';

// Rate limiting per IP address for unauthenticated routes
export const ipRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response): void => {
    throw new TooManyRequestsError(
      'Too many requests from this IP, please try again later.',
    );
  },
});

// Rate limiting per authenticated user account id
// This should be used after authentication middleware
export const userRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, _res: Response): void => {
    throw new TooManyRequestsError(
      'Too many requests from this IP, please try again later.',
    );
  },
});

