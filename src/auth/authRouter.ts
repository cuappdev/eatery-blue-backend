import { Router } from 'express';

import { requireAuth } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  getCbordSessionSchema,
  linkCbordAccountSchema,
  refreshAccessTokenSchema,
  verifyDeviceUuidSchema,
} from './auth.schema.js';
import {
  getCbordSession,
  linkCbordAccount,
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
  validateRequest(linkCbordAccountSchema),
  linkCbordAccount,
);
router.post(
  '/get/refresh',
  requireAuth,
  validateRequest(getCbordSessionSchema),
  getCbordSession,
);

export default router;
