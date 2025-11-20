import NodeCache from 'node-cache';
import { z } from 'zod';

import type { Eatery, Event } from '@prisma/client';

import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { prisma } from '../prisma.js';
import { UnauthorizedError } from './AppError.js';

export const cacheRouter = Router();
const appCache = new NodeCache({ stdTTL: 0 }); // never expire

export type EateryWithEvents = Eatery & { events: Event[] };

/**
 * Cache keys used throughout the application
 */
const CACHE_KEYS = {
  ALL_EATERIES_DATA: 'allEateriesData',
  ALL_EATERIES_ETAG: 'allEateriesEtag',
} as const;

/**
 * Schema for validating cached eatery data
 * This will be validated by the scraper that sends the data
 * Max 100 eateries for safety to prevent memory issues
 */
const allEateriesSchema = z.object({
  body: z.object({
    eateries: z.array(z.any()).max(100),
  }),
});

function requireCacheRefreshSecret(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const provided = req.header(process.env.CACHE_REFRESH_HEADER!);
  if (!provided || provided !== process.env.CACHE_REFRESH_SECRET) {
    throw new UnauthorizedError('Invalid cache refresh secret provided');
  }
  next();
}

export function getAllEateriesData(): EateryWithEvents[] {
  const data = appCache.get<EateryWithEvents[]>(CACHE_KEYS.ALL_EATERIES_DATA);
  if (!data) {
    throw new Error('Cache miss: eateries data not found in cache');
  }
  return data;
}

export function getEateriesEtag(): string {
  const etag = appCache.get<string>(CACHE_KEYS.ALL_EATERIES_ETAG);
  if (!etag) {
    throw new Error('Cache miss: eateries ETag not found in cache');
  }
  return etag;
}

export async function refreshCacheFromDB() {
  clearAppCache();

  // Temporarily suppress console logs for this query
  const originalLog = console.log;
  console.log = () => {};

  const eateries = await prisma.eatery.findMany({
    include: {
      events: {
        include: {
          menu: {
            include: {
              items: {
                include: {
                  dietaryPreferences: true,
                  allergens: true,
                },
              },
            },
          },
        },
        orderBy: {
          startTimestamp: 'asc',
        },
      },
    },
  });

  // Restore console.log
  console.log = originalLog;

  populateCache(eateries);
}

export function clearAppCache(): void {
  appCache.flushAll();
}

function populateCache(eateries: EateryWithEvents[]): void {
  appCache.set(CACHE_KEYS.ALL_EATERIES_DATA, eateries);
  const etag = `"eateries-${Date.now()}"`;
  appCache.set(CACHE_KEYS.ALL_EATERIES_ETAG, etag);
  console.log(
    `Cache updated at ${new Date().toISOString()}, ${eateries.length} eateries cached.`,
  );
}

/**
 * Private cache refresh route for scraper
 * Allows the scraper to update the cache with new eatery data
 */
cacheRouter.post(
  '/',
  requireCacheRefreshSecret,
  validateRequest(allEateriesSchema),
  (req, res) => {
    const { eateries } = req.body;
    populateCache(eateries);
    return res.status(200).json({
      message: 'Cache refreshed successfully',
      count: eateries.length,
    });
  },
);
