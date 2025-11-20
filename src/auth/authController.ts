import type { Request, Response } from 'express';

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
