import { Router } from 'express';

import { EateryController } from './eateryController.js';

export const eateryRouter = Router();

eateryRouter.get('/', EateryController.getAllEateries);
eateryRouter.get('/:id', EateryController.getEateryById);
