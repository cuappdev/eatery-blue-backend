import { Router } from 'express';

import { requireAdmin } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { semesterSchema } from './semester.schema.js';
import {
  createSemester,
  deleteSemester,
  getAllSemesters,
  getSemesterById,
  updateSemester,
} from './semesterController.js';

const router = Router();

router.get('/', getAllSemesters);
router.get('/:semesterId', requireAdmin, getSemesterById);
router.post('/', requireAdmin, validateRequest(semesterSchema), createSemester);
router.put(
  '/:semesterId',
  requireAdmin,
  validateRequest(semesterSchema),
  updateSemester,
);
router.delete('/:semesterId', requireAdmin, deleteSemester);

export default router;
