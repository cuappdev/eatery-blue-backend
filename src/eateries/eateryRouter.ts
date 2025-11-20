import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { getAllEateriesSchema } from './eateries.schema.js';
import { getAllEateries, getEateryById } from './eateryController.js';

export const eateryRouter = Router();

eateryRouter.get('/', validateRequest(getAllEateriesSchema), getAllEateries);
eateryRouter.get('/:eateryId', getEateryById);
