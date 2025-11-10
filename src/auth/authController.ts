import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';


export const authorizeDeviceId = async (req: Request, res: Response) => {
  const { deviceId } = req.body;

  const user = await prisma.user.upsert({
    where: { deviceId },
    update: {},
    create: {
      deviceId,
    },
    select: {
      id: true,
      deviceId: true,
      favoritedEateries: {
        select: {
          eateryId: true,
        }
      },
      favoritedItemNames: true,
    },
  });

  return res.json({
    ...user,
    favoritedEateries: user.favoritedEateries.map(fe => fe.eateryId),
  });
}
