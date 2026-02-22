import type { Request, Response } from 'express';

import { cbordService } from '../services/cbord.service.js';

export const getFinancials = async (
  req: Request<unknown, unknown, { sessionId: string }>,
  res: Response,
) => {
  const { sessionId } = req.body;

  // Fetch accounts and transactions in parallel
  const [accounts, transactions] = await Promise.all([
    cbordService.retrieveAccounts(sessionId),
    cbordService.retrieveTransactionHistory(sessionId),
  ]);

  res.json({ accounts, transactions });
};
