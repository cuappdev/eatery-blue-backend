import { Router } from 'express';

import { getAllEateries } from './eateryController.js';

const router = Router();

router.get('/', getAllEateries);

export default router;

