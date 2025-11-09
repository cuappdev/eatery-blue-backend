import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { verifyFirebaseTokenSchema } from './auth.schema.js';
import { refreshAccessToken, verifyFirebaseToken } from './authController.js';

const router = Router();

router.post(
  '/verify-token',
  validateRequest(verifyFirebaseTokenSchema),
  verifyFirebaseToken,
);
router.post('/refresh-token', refreshAccessToken);

export default router;
