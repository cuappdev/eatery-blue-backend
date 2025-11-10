import NodeCache from 'node-cache';

import type { Eatery } from '@prisma/client';

import { Router } from 'express';

export const cacheRouter = Router();

export const appCache = new NodeCache({ stdTTL: 0 }); // No TTL (0 means never expire)

export function getAllEateriesData(): Eatery[] {
  const data = appCache.get<Eatery[]>('allEateriesData');
  if (!data) {
    throw new Error('Cache is cold. allEateriesData is not set.');
  }
  return data as Eatery[];
}

// Private cache refresh route for scraper
// TODO: add checking for secret key middleware
cacheRouter.post('/internal/refresh-all-data', (req, res) => {
  appCache.set('allEateriesData', req.body);
  console.log('Cache updated, allEateriesData refreshed.');
  res.status(200).json({ ok: true });
});

// Optional: clear everything (for tests / admin)
export function clearAppCache(): void {
  appCache.flushAll();
}
