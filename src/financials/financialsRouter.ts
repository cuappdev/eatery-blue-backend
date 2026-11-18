import { Router } from 'express';

import { requireAuth } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { getFinancialsSchema } from './financials.schema.js';
import { getBarcode, getFinancials } from './financialsController.js';

const router = Router();

router.post(
  '/',
  requireAuth,
  validateRequest(getFinancialsSchema),
  getFinancials,
);
router.post(
  '/barcode',
  requireAuth,
  validateRequest(getFinancialsSchema),
  getBarcode,
);

export default router;
