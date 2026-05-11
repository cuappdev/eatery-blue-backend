import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { makeItemKey } from '../utils/itemKey.js';

export const getItemPreferenceCounts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { items } = req.body as {
      items: { itemName: string; cornellId: number }[];
    };

    const itemKeys = items.map(({ itemName, cornellId }) =>
      makeItemKey(itemName, cornellId),
    );

    const rows = await prisma.itemPreferenceCounts.findMany({
      where: { itemKey: { in: itemKeys } },
    });

    const countsMap = new Map(rows.map((r) => [r.itemKey, r]));

    const counts = items.map(({ itemName, cornellId }) => {
      const key = makeItemKey(itemName, cornellId);
      const row = countsMap.get(key);
      return {
        itemName,
        cornellId,
        numLikes: row?.numLikes ?? 0,
        numDislikes: row?.numDislikes ?? 0,
      };
    });

    return res.json(counts);
  } catch (error) {
    return next(error);
  }
};
