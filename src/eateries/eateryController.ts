import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';

export const getAllEateries = async (_req: Request, res: Response) => {
  const startTime = Date.now();

  const eateries = await prisma.eatery.findMany({
    include: {
      events: {
        include: {
          menu: {
            include: {
              items: {
                include: {
                  allergens: true,
                  dietaryPreferences: true,
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
    orderBy: {
      cornellId: 'asc',
    },
  });

  const queryDuration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[GET /eateries] Fetched ${eateries.length} eateries in ${queryDuration}s`);

  return res.json({
    eateries,
    meta: {
      count: eateries.length,
      queryTime: `${queryDuration}s`,
    },
  });
};

