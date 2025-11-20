import type { NextFunction, Request, Response } from 'express';

import { cbordService } from '../services/cbord.service.js';

export const getFinancials = async (
  req: Request<unknown, unknown, { sessionId?: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Authenticated user not found');
    }

    // sessionId is now provided in the request body
    const { sessionId } = req.body as { sessionId?: string };
    if (!sessionId) {
      throw new Error('sessionId is required in request body');
    }

    // Fetch accounts and transactions in parallel
    const [accounts, transactions] = await Promise.all([
      cbordService.retrieveAccounts(sessionId!),
      cbordService.retrieveTransactionHistory(sessionId!),
    ]);

    res.json({ accounts, transactions });
  } catch (error) {
    next(error);
  }
};
