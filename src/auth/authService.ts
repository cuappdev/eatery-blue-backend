import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { prisma } from '../prisma.js';
import { ForbiddenError } from '../utils/AppError.js';

const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

const generateAccessToken = (userId: number): string => {
  return jwt.sign(
    { userId },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: '15m' },
  );
};

export const verifyDeviceUuid = async (deviceUuid: string) => {
  const refreshToken = generateRefreshToken();

  const user = await prisma.user.upsert({
    where: { deviceUuid },
    update: { refreshToken },
    create: { deviceUuid, refreshToken },
  });

  const accessToken = generateAccessToken(user.id);

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const user = await prisma.user.findUnique({
    where: { refreshToken },
  });

  if (!user) {
    throw new ForbiddenError('Invalid refresh token');
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken();

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};