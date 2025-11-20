import NodeCache from 'node-cache';

import type { Eatery, Event } from '@prisma/client';

import {
  type NextFunction,
  type Request,
  type Response,
  Router,
} from 'express';

import { EaterySchema } from '../eateries/eateries.schema.js';
import { prisma } from '../prisma.js';
import { UnauthorizedError } from './AppError.js';

export const cacheRouter = Router();
export const appCache = new NodeCache({ stdTTL: 0 }); // never expire

export type EateryWithEvents = Eatery & { events: Event[] };

function requireSecret(req: Request, _res: Response, next: NextFunction): void {
  const provided = req.header(process.env.CACHE_REFRESH_HEADER!);
  if (!provided || provided !== process.env.CACHE_REFRESH_SECRET) {
    throw new UnauthorizedError();
  }
  next();
}

export function getAllEateriesData(): EateryWithEvents[] {
  const data = appCache.get<EateryWithEvents[]>('allEateriesData');
  if (!data) {
    const err = new Error(
      'Cache is cold. allEateriesData is not set.',
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }
  return data;
}

// Private cache refresh route for scraper
cacheRouter.post('/internal/refresh-cache', requireSecret, (req, res) => {
  const parse = EaterySchema.safeParse(req.body);
  if (!parse.success) {
    res
      .status(400)
      .json({ error: 'Invalid payload', issues: parse.error.issues });
    return;
  }

  appCache.set('allEateriesData', parse.data);
  const etag = `"eateries-${Date.now()}"`;
  appCache.set('allEateriesEtag', etag);

  console.log('Cache updated, allEateriesData refreshed.');
  res.status(200).json({ ok: true });
});

export async function refreshCacheFromDB() {
  appCache.del('allEateriesData');
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
          userEventVotes: true,
        },
        orderBy: {
          startTimestamp: 'asc',
        },
      },
    },
  });
  appCache.set('allEateriesData', eateries);
  const etag = `"eateries-${Date.now()}"`;
  appCache.set('allEateriesEtag', etag);
  console.log('Cache updated from DB, allEateriesData refreshed.');
}

export function clearAppCache(): void {
  appCache.flushAll();
}
