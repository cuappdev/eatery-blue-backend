import { Router } from 'express';

import { getFinancials } from './financialsController.js';

const router = Router();

router.get('/', getFinancials);

export default router;
