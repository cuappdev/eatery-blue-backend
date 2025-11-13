import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  favoriteEaterySchema,
  favoriteItemSchema,
  fcmTokenSchema,
} from './user.schema.js';
import {
  addFavoriteEatery,
  addFavoriteItem,
  addFcmToken,
  removeFavoriteEatery,
  removeFavoriteItem,
  removeFcmToken,
  requireUser,
} from './userController.js';

const router = Router();

router.use(requireUser);

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

router.post(
  '/favorites/items',
  validateRequest(favoriteItemSchema),
  addFavoriteItem,
);
router.delete(
  '/favorites/items',
  validateRequest(favoriteItemSchema),
  removeFavoriteItem,
);

router.post(
  '/favorites/eateries',
  validateRequest(favoriteEaterySchema),
  addFavoriteEatery,
);
router.delete(
  '/favorites/eateries',
  validateRequest(favoriteEaterySchema),
  removeFavoriteEatery,
);

export default router;
