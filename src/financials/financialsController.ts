import type { NextFunction, Request, Response } from 'express';

import { cbordService } from '../services/cbord.service.js';

export const getFinancials = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sessionId } = res.locals as { sessionId: string };

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
