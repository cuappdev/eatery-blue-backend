import type { NextFunction, Request, Response } from 'express';

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Get color based on HTTP status code
const getStatusColor = (status: number): string => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  if (status >= 200) return colors.green;
  return colors.white;
};

// Get color based on HTTP method
const getMethodColor = (method: string): string => {
  switch (method) {
    case 'GET':
      return colors.green;
    case 'POST':
      return colors.yellow;
    case 'PUT':
      return colors.blue;
    case 'PATCH':
      return colors.magenta;
    case 'DELETE':
      return colors.red;
    default:
      return colors.white;
  }
};

// Format response time with appropriate color
const formatResponseTime = (time: number): string => {
  const color =
    time > 1000 ? colors.red : time > 500 ? colors.yellow : colors.green;
  return `${color}${time}ms${colors.reset}`;
};

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Listen for when the response finishes
  res.on('finish', () => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    const statusColor = getStatusColor(res.statusCode);
    const methodColor = getMethodColor(req.method);
    const userAgent = req.get('User-Agent') || 'Unknown';
    const contentLength = res.get('Content-Length') || '0';

    // Log format: [timestamp] METHOD /path STATUS - response_time content_length IP "user-agent"
    console.log(
      `${colors.gray}[${timestamp}]${colors.reset} ` +
        `${methodColor}${req.method}${colors.reset} ` +
        `${colors.bright}${req.originalUrl || req.url}${colors.reset} ` +
        `${statusColor}${res.statusCode}${colors.reset} - ` +
        `${formatResponseTime(responseTime)} ` +
        `${colors.cyan}${contentLength}b${colors.reset} ` +
        `${colors.gray}${req.ip || req.connection.remoteAddress}${colors.reset} ` +
        `${colors.gray}"${userAgent}"${colors.reset}`,
    );
  });

  // Handle connection errors
  res.on('close', () => {
    if (!res.writableEnded) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      console.log(
        `${colors.gray}[${timestamp}]${colors.reset} ` +
          `${colors.red}${req.method}${colors.reset} ` +
          `${colors.bright}${req.originalUrl || req.url}${colors.reset} ` +
          `${colors.red}CONNECTION_CLOSED${colors.reset} - ` +
          `${formatResponseTime(responseTime)} ` +
          `${colors.gray}${req.ip || req.connection.remoteAddress}${colors.reset}`,
      );
    }
  });

  next();
};
