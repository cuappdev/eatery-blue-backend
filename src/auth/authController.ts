import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { cbordService } from '../services/cbord.service.js';

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
        },
      },
      favoritedItemNames: true,
    },
  });

  return res.json({
    ...user,
    favoritedEateries: user.favoritedEateries.map((fe) => fe.eateryId),
  });
};

/**
 * @desc Links a GET/CBORD account to a deviceId via a PIN.
 * This is the one-time setup for the finance feature.
 */
export const getAuthorize = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { deviceId, pin, session_id } = req.body;

  try {
    await cbordService.createPin(deviceId, pin, session_id);

    // This route does NOT create the user, client should call /auth/register first.
    // We just link the PIN.
    return res
      .status(200)
      .json({ message: 'GET account linked successfully.' });
  } catch (error) {
    return next(error);
  }
};

/**
 * @desc Exchanges a deviceId and PIN for a new GET/CBORD session_id.
 * This is the "persistent login" flow.
 */
export const getRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { deviceId, pin } = req.body;

  try {
    const newSessionId = await cbordService.authenticatePin(deviceId, pin);

    return res.status(200).json({ sessionId: newSessionId });
  } catch (error) {
    return next(error);
  }
};
