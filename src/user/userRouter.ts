import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { fcmTokenSchema } from './user.schema.js';
import { addFcmToken, removeFcmToken } from './userController.js';

const router = Router();

/**
 * @route POST /user/fcm-token
 * @desc Add an FCM token for push notifications
 * @access Private (requires X-Device-ID)
 */
router.post('/fcm-token', validateRequest(fcmTokenSchema), addFcmToken);

/**
 * @route DELETE /user/fcm-token
 * @desc Remove an FCM token to opt-out
 * @access Private (requires X-Device-ID)
 */
router.delete('/fcm-token', validateRequest(fcmTokenSchema), removeFcmToken);

export default router;
