import { Router } from 'express';

import { requireAdmin } from '../middleware/authentication.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from './courseController.js';
import { courseSchema } from './courses.schema.js';

const router = Router();

router.get('/', requireAdmin, getAllCourses);
router.get('/:courseId', requireAdmin, getCourseById);
router.post('/', requireAdmin, validateRequest(courseSchema), createCourse);
router.put(
  '/:courseId',
  requireAdmin,
  validateRequest(courseSchema),
  updateCourse,
);
router.delete('/:courseId', requireAdmin, deleteCourse);

export default router;
