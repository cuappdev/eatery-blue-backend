import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { BadRequestError, NotFoundError } from '../utils/AppError.js';

/**
 * Middleware to extract deviceId from header and attach user to request.
 * This is used for all routes that act on behalf of a user.
 */
export const requireUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return next(
      new BadRequestError('Device ID header (X-Device-ID) is required.'),
    );
  }

  const user = await prisma.user.findUnique({
    where: { deviceId },
  });

  if (!user) {
    return next(
      new NotFoundError(
        `User with deviceId "${deviceId}" not found. Please register first.`,
      ),
    );
  }

  res.locals.user = user;
  next();
};

/**
 * Add or update an FCM token for the user.
 * The token itself is unique, so this will update the existing
 * record if it's already in the DB, linking it to the current user.
 */
export const addFcmToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;
  const { user } = res.locals;

  await prisma.fCMToken.upsert({
    where: { token },
    update: {
      userId: user.id,
    },
    create: {
      token,
      userId: user.id,
    },
  });

  res.status(200).json({ message: 'Token registered successfully.' });
};

export const removeFcmToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { token } = req.body;
  const { user } = res.locals;

  try {
    await prisma.fCMToken.delete({
      where: {
        token,
        userId: user.id,
      },
    });
    res.status(200).json({ message: 'Token removed successfully.' });
  } catch (e) {
    res.status(200).json({ message: 'Token removal processed. Error: ' + e });
  }
};
