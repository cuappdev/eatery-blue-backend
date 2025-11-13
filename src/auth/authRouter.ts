import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  authorizeDeviceIdSchema,
  getAuthorizeSchema,
  getRefreshSchema,
} from './auth.schema.js';
import {
  authorizeDeviceId,
  getAuthorize,
  getRefresh,
} from './authController.js';

const router = Router();

router.post(
  '/register',
  validateRequest(authorizeDeviceIdSchema),
  authorizeDeviceId,
);

router.post(
  '/get/authorize',
  validateRequest(getAuthorizeSchema),
  getAuthorize,
);
router.post('/get/refresh', validateRequest(getRefreshSchema), getRefresh);

export default router;
