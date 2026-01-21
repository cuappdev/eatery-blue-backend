import { Router } from 'express';

import { requireAuth } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { getFinancialsSchema } from './financials.schema.js';
import { getFinancials } from './financialsController.js';

const router = Router();

router.post('/', requireAuth, validateRequest(getFinancialsSchema), getFinancials);

export default router;
