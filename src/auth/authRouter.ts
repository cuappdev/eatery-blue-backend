import { Router } from 'express';

import { requireAuth } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getAuthorizeSchema,
  getRefreshSchema,
  refreshAccessTokenSchema,
  verifyDeviceUuidSchema,
} from './auth.schema.js';
import {
  getAuthorize,
  getRefresh,
  refreshAccessToken,
  verifyDeviceUuid,
} from './authController.js';

const router = Router();

router.post(
  '/verify-token',
  validateRequest(verifyDeviceUuidSchema),
  verifyDeviceUuid,
);
router.post(
  '/refresh-token',
  validateRequest(refreshAccessTokenSchema),
  refreshAccessToken,
);
router.post(
  '/get/authorize',
  requireAuth,
  validateRequest(getAuthorizeSchema),
  getAuthorize,
);
router.post(
  '/get/refresh',
  requireAuth,
  validateRequest(getRefreshSchema),
  getRefresh,
);

export default router;
