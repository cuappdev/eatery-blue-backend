import type { NextFunction, Request, Response } from 'express';

import { AppError } from '../utils/AppError.js';

export const globalErrorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // Check if the error is one of the operational (intentionally generated) AppErrors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      errorCode: err.errorCode,
      ...(err.data && { data: err.data }),
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  }

  console.error(err);
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  return res.status(500).json({
    status: 'error',
    statusCode: 500,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
