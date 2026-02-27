import type { Request, Response } from 'express';

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
export const linkCbordAccount = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { pin, sessionId } = req.body;

  await cbordService.createPin(String(userId), pin, sessionId);

  // This route does NOT create the user, just links the PIN.
  return res.json({ message: 'GET account linked successfully.' });
};

/**
 * @desc Exchanges a deviceId and PIN for a new GET/CBORD session_id.
 * This is the "persistent login" flow.
 */
export const getCbordSession = async (req: Request, res: Response) => {
  const { userId } = req.user!;
  const { pin } = req.body;

  const newSessionId = await cbordService.authenticatePin(String(userId), pin);

  return res.json({ sessionId: newSessionId });
};
