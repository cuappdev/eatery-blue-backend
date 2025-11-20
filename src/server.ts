import 'dotenv/config';
import helmet from 'helmet';

import express from 'express';
import type { Request, Response } from 'express';

import authRouter from './auth/authRouter.js';
import eateryRouter from './eateries/eateryRouter.js';
import financialRouter from './financials/financialsRouter.js';
import { requireAuth } from './middleware/authentication.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logger.js';
import { ipRateLimiter } from './middleware/rateLimit.js';
import { prisma } from './prisma.js';
import userRouter from './users/userRouter.js';
import { cacheRouter } from './utils/cache.js';
import { refreshCacheFromDB } from './utils/cache.js';

const app = express();

// Trust proxy - necessary when behind a reverse proxy (nginx)
app.set('trust proxy', 1);

app.use(requestLogger);
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(ipRateLimiter);

const router = express.Router();

// Health check endpoint
router.get('/health', async (_: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'unknown',
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database = 'connected';
    res.status(200).json(healthCheck);
  } catch {
    healthCheck.status = 'unhealthy';
    healthCheck.database = 'disconnected';
    res.status(503).json(healthCheck);
  }
});

// Public routes
router.use('/auth', authRouter);
router.use('/internal/cache', cacheRouter);
router.use('/eateries', eateryRouter);

// Protected routes
router.use(requireAuth);
router.use('/users', userRouter);
router.use('/financials', financialRouter);

app.use(router);

app.use(globalErrorHandler);

const port = process.env.PORT || '8000';

const server = app.listen(port, async () => {
  console.log(`Express app listening at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Verify database connection on startup
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Initial cache refresh
  await refreshCacheFromDB();
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');

  server.close(async () => {
    console.log('HTTP server closed');

    // Disconnect from database
    await prisma.$disconnect();
    console.log('Database disconnected');

    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
