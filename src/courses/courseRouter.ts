import { Router } from 'express';

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

router.get('/', getAllCourses);
router.get('/:courseId', getCourseById);
router.post('/', validateRequest(courseSchema), createCourse);
router.put(
  '/:courseId',
  validateRequest(courseSchema),
  updateCourse,
);
router.delete('/:courseId', deleteCourse);

export default router;
