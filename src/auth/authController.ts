import type { Request, Response } from 'express';

<<<<<<< HEAD
<<<<<<< HEAD
=======
import { firebaseAdmin } from '../firebase.js';
>>>>>>> 9934acb (add notification and firebase logic)
=======
import { firebaseAdmin } from '../firebase.js';
>>>>>>> 9934acb2fd636275bdf7320fb404ff0cbe51ea16
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
