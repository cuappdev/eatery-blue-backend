import type { NextFunction, Request, Response } from 'express';

import { UnauthorizedError } from '../utils/AppError.js';

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided or wrong format.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('No token provided.');
  }

  // TODO: Finish body when GET authentication is finalized
  // Override Express Request type to include session info in the request object

  return next();
};
