import NodeCache from 'node-cache';

import type { Eatery } from '@prisma/client';

import { type Request, type Response, Router } from 'express';

import { EaterySchema } from '../eateries/eateries.schema.js';

export const cacheRouter = Router();
export const appCache = new NodeCache({ stdTTL: 0 }); // never expire

const REFRESH_HEADER = 'x-refresh-secret';

function requireSecret(req: Request, res: Response): boolean {
  const provided = req.header(REFRESH_HEADER);
  if (!process.env.REFRESH_SECRET) {
    res.status(500).json({ error: 'Server refresh secret not configured.' });
    return false;
  }
  if (!provided || provided !== process.env.REFRESH_SECRET) {
    res.status(401).json({ error: 'Unauthorized.' });
    return false;
  }
  return true;
}

export function getAllEateriesData(): Eatery[] {
  const data = appCache.get<Eatery[]>('allEateriesData');
  if (!data) {
    const err: any = new Error('Cache is cold. allEateriesData is not set.');
    err.status = 503;
    throw err;
  }
  return data;
}

// Private cache refresh route for scraper
cacheRouter.post('/internal/refresh-all-data', (req, res) => {
  if (!requireSecret(req, res)) return;
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

export function clearAppCache(): void {
  appCache.flushAll();
}
