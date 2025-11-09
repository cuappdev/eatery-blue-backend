import type { CourseOfferingRole } from '@prisma/client';

// Course offering role constants
export const COURSE_OFFERING_ROLES = {
  INSTRUCTOR: 'INSTRUCTOR' as const,
  STUDENT: 'STUDENT' as const,
  VIEWER: 'VIEWER' as const,
} as const;

// System role constants (not stored in database, used for API responses)
export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN' as const,
} as const;

// Array of all course offering roles for validation
export const COURSE_OFFERING_ROLE_VALUES: CourseOfferingRole[] = [
  COURSE_OFFERING_ROLES.INSTRUCTOR,
  COURSE_OFFERING_ROLES.STUDENT,
  COURSE_OFFERING_ROLES.VIEWER,
];

// Type for course offering roles (derived from the constants)
export type CourseOfferingRoleType =
  (typeof COURSE_OFFERING_ROLES)[keyof typeof COURSE_OFFERING_ROLES];
