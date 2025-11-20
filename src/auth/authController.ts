import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { ForbiddenError } from '../utils/AppError.js';

export const verifyDeviceUuid = async (req: Request, res: Response) => {
  const { deviceUuid } = req.body;
  const refreshToken = crypto.randomBytes(64).toString('hex');

  const user = await prisma.user.upsert({
    where: { deviceUuid },
    // If the user exists, update the refreshToken
    update: {
      refreshToken,
    },
    // If the user does not exist, create a new user
    create: {
      deviceUuid,
      refreshToken,
    },
  });

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' },
  );

  return res.json({ accessToken, refreshToken });
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const user = await prisma.user.findFirst({
    where: { refreshToken },
  });

  if (!user) {
    throw new ForbiddenError('Invalid refresh token');
  }

  const newAccessToken = jwt.sign(
    { userId: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' },
  );

  const newRefreshToken = crypto.randomBytes(64).toString('hex');

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
};
