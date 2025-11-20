import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';

export const getMe = async (req: Request, res: Response) => {
  const { userId } = req.user!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      deviceUuid: true,
      fcmTokens: true,
      reports: true,
      favoritedEateries: true,
      favoritedItemNames: true,
      userEventVotes: true,
    },
  });

  return res.json({ user });
};
