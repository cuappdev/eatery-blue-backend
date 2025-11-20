import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { getAllEateriesSchema } from './eateries.schema.js';
import { getAllEateries, getEateryById } from './eateryController.js';

const router = Router();

router.get('/', validateRequest(getAllEateriesSchema), getAllEateries);
router.get('/:eateryId', getEateryById);

export default router;
