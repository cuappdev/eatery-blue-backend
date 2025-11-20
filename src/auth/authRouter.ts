import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  refreshAccessTokenSchema,
  verifyDeviceUuidSchema,
} from './auth.schema.js';
import { refreshAccessToken, verifyDeviceUuid } from './authController.js';

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

export default router;
