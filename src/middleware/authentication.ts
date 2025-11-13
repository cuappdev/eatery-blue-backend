import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../utils/AppError.js';

/**
 * Middleware to require a valid GET/CBORD session token.
 * It extracts the token and adds it to res.locals.sessionId.
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('No token provided or wrong format.'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new UnauthorizedError('No token provided.'));
  }

  res.locals.sessionId = token;
  return next();
};
