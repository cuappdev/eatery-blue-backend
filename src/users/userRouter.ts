import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  addFavoriteEatery,
  addFavoriteItem,
  addFcmToken,
  deleteNotifications,
  getFavoriteMatches,
  getNotifications,
  markNotificationsRead,
  removeFavoriteEatery,
  removeFavoriteItem,
  removeFcmToken,
  setItemPreference,
} from './userController.js';
import { getMe } from './userController.js';
import {
  favoriteEaterySchema,
  favoriteItemSchema,
  fcmTokenSchema,
  itemPreferenceSchema,
  notificationIdsSchema,
} from './users.schema.js';

const router = Router();

router.get('/me', getMe);
router.post('/fcm-token', validateRequest(fcmTokenSchema), addFcmToken);
router.delete('/fcm-token', validateRequest(fcmTokenSchema), removeFcmToken);

router.post(
  '/preferences',
  validateRequest(itemPreferenceSchema),
  setItemPreference,
);

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
router.get('/favorites/matches', getFavoriteMatches);

router.get('/notifications', getNotifications);
router.patch(
  '/notifications/read',
  validateRequest(notificationIdsSchema),
  markNotificationsRead,
);
router.delete(
  '/notifications',
  validateRequest(notificationIdsSchema),
  deleteNotifications,
);

export default router;
