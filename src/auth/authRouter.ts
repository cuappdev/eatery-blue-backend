import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { authorizeDeviceIdSchema } from './auth.schema.js';
import { authorizeDeviceId } from './authController.js';

const router = Router();

router.post(
  '/authorize',
  validateRequest(authorizeDeviceIdSchema),
  authorizeDeviceId,
);

export default router;
