import type { NextFunction, Request, Response } from 'express';

import { cbordService } from '../services/cbord.service.js';
import * as authService from './authService.js';

export const verifyDeviceUuid = async (req: Request, res: Response) => {
  const { deviceUuid } = req.body;
  const tokens = await authService.verifyDeviceUuid(deviceUuid);
  return res.json(tokens);
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  return res.json(tokens);
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
  const { userId } = req.user!;
  const { pin, sessionId } = req.body;

  try {
    await cbordService.createPin(String(userId), pin, sessionId);

    // This route does NOT create the user, just links the PIN.
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
  const { userId } = req.user!;
  const { pin } = req.body;

  try {
    const newSessionId = await cbordService.authenticatePin(
      String(userId),
      pin,
    );

    return res.status(200).json({ sessionId: newSessionId });
  } catch (error) {
    return next(error);
  }
};
