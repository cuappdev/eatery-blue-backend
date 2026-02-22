import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import {
  addFavoriteEatery,
  addFavoriteItem,
  addFcmToken,
  getFavoriteMatches,
  removeFavoriteEatery,
  removeFavoriteItem,
  removeFcmToken,
} from './userController.js';
import { getMe } from './userController.js';
import {
  favoriteEaterySchema,
  favoriteItemSchema,
  fcmTokenSchema,
} from './users.schema.js';

const router = Router();

router.get('/me', getMe);
router.post('/fcm-token', validateRequest(fcmTokenSchema), addFcmToken);
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
router.get('/favorites/matches', getFavoriteMatches);

export default router;
