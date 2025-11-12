import type { NextFunction, Request, Response } from 'express';

import { appCache } from '../utils/cache.js';
import { EateryService } from './eateryService.js';

export class EateryController {
  static getAllEateries(req: Request, res: Response, next: NextFunction): void {
    try {
      const etag = appCache.get<string>('allEateriesEtag'); // etag with time of last data refresh
      if (etag) {
        res.setHeader('ETag', etag);
        if (req.headers['if-none-match'] === etag) {
          res.status(304).end();
          return;
        }
      }
      const allEateries = EateryService.getAllEateries();
      res.status(200).type('application/json').send(allEateries);
    } catch (error) {
      next(error);
    }
  }

  static getEateryById(req: Request, res: Response, next: NextFunction): void {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 0) {
        res.status(400).json({ error: 'id must be a positive integer' });
        return;
      }
      const eatery = EateryService.getEateryById(id);
      res.status(200).json(eatery);
    } catch (error) {
      next(error);
    }
  }
}
