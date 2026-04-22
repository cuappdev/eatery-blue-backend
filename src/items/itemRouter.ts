import { Router } from 'express';

import { validateRequest } from '../middleware/validateRequest.js';
import { getItemPreferenceCounts } from './itemController.js';
import { getItemPreferenceCountsSchema } from './items.schema.js';

const router = Router();

router.post(
  '/preference-counts',
  validateRequest(getItemPreferenceCountsSchema),
  getItemPreferenceCounts,
);

export default router;
