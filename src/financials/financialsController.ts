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

export const getBarcode = async (
  req: Request<unknown, unknown, { sessionId: string }>,
  res: Response,
) => {
  const { sessionId } = req.body;

  const barcode = await cbordService.retrieveBarcode(sessionId);

  // The barcode seed is a payment credential, so never cache it
  res.set('Cache-Control', 'no-store');
  res.json(barcode);
};
