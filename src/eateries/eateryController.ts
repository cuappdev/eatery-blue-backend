import type { Request, Response } from 'express';

import * as eateryService from './eateryService.js';

export const getAllEateries = async (req: Request, res: Response) => {
  const { days } = req.query;
  const eateries = await eateryService.getAllEateries(
    days as number | undefined,
  );
  return res.json(eateries);
};

export const getEateryById = async (req: Request, res: Response) => {
  const eateryId = parseInt(req.params.eateryId, 10);
  const eatery = await eateryService.getEateryById(eateryId);
  return res.json(eatery);
};
