import type { NextFunction, Request, Response } from 'express';

import { EateryService } from './eateryService.js';

export class EateryController {
  static async getAllEateries(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const allEateries = await EateryService.getAllEateries();
      res.type('application/json').send(allEateries);
    } catch (error) {
      next(error);
    }
  }

  static async getEateryById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const eatery = await EateryService.getEateryById(id);
      res.json(eatery);
    } catch (error) {
      next(error);
    }
  }
}
