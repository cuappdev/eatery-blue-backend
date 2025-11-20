import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  authorizeDeviceIdSchema,
  getAuthorizeSchema,
  getRefreshSchema,
  refreshAccessTokenSchema,
  verifyDeviceUuidSchema,
} from './auth.schema.js';
import {
  authorizeDeviceId,
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
