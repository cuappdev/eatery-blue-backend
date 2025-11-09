import { Router } from 'express';

import { requireAdmin } from '../middleware/authentication.js';

const router = Router();

router.get('/stats', requireAdmin, (_req, res) => {
  res.json({ message: 'Admin stats endpoint' });
});

router.get('/settings', requireAdmin, (_req, res) => {
  res.json({ message: 'Admin settings endpoint' });
});

router.get('/audit-logs', requireAdmin, (_req, res) => {
  res.json({ message: 'Admin audit logs endpoint' });
});

export default router;
