export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR', // 400
  BAD_REQUEST = 'BAD_REQUEST', // 400
  UNAUTHORIZED = 'UNAUTHORIZED', // 401
  FORBIDDEN = 'FORBIDDEN', // 403
  NOT_FOUND = 'NOT_FOUND', // 404
  CONFLICT = 'CONFLICT', // 409
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS', // 429
}

export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public errorCode: ErrorCodes;
  public data?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    errorCode: ErrorCodes,
    data?: Record<string, unknown>,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.errorCode = errorCode;
    if (data) {
      this.data = data;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = 'Validation Error',
    data?: Record<string, unknown>,
  ) {
    super(message, 400, ErrorCodes.VALIDATION_ERROR, data);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', data?: Record<string, unknown>) {
    super(message, 400, ErrorCodes.BAD_REQUEST, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    message: string = 'Unauthorized',
    data?: Record<string, unknown>,
  ) {
    super(message, 401, ErrorCodes.UNAUTHORIZED, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', data?: Record<string, unknown>) {
    super(message, 403, ErrorCodes.FORBIDDEN, data);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    data?: Record<string, unknown>,
  ) {
    super(message, 404, ErrorCodes.NOT_FOUND, data);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', data?: Record<string, unknown>) {
    super(message, 409, ErrorCodes.CONFLICT, data);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Too Many Requests',
    data?: Record<string, unknown>,
  ) {
    super(message, 429, ErrorCodes.TOO_MANY_REQUESTS, data);
  }
}
