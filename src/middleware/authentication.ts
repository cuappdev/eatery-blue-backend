import jwt from 'jsonwebtoken';

import type { NextFunction, Request, Response } from 'express';

import type { AuthJwtPayload } from '../types/express/index.js';
import { UnauthorizedError } from '../utils/AppError.js';

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Development bypass
  if (process.env.NODE_ENV === 'development') {
    req.user = {
      userId: 1,
      isAdmin: true,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided or wrong format.');
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw new UnauthorizedError('No token provided.');
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decodedToken) => {
    if (err || !decodedToken || typeof decodedToken === 'string') {
      throw new UnauthorizedError('Invalid token.');
    }
    req.user = decodedToken as AuthJwtPayload;
  });

  return next();
};
