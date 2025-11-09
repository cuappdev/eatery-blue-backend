import type { CourseOfferingRole } from '@prisma/client';

import type { Request, Response } from 'express';

import { COURSE_OFFERING_ROLES, SYSTEM_ROLES } from '../constants/roles.js';
import { prisma } from '../prisma.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError.js';

// Helper function to check if user has access to course offering
const checkCourseOfferingAccess = async (
  userId: number,
  offeringId: number,
  requiredRoles?: CourseOfferingRole[],
) => {
  const enrollment = await prisma.courseOfferingEnrollment.findUnique({
    where: {
      userId_courseOfferingId: {
        userId,
        courseOfferingId: offeringId,
      },
    },
  });

  if (!enrollment) {
    return null;
  }

  if (requiredRoles && !requiredRoles.includes(enrollment.role)) {
    return null;
  }

  return enrollment;
};

// Helper function to check if user is instructor of course offering
const checkInstructorAccess = async (userId: number, offeringId: number) => {
  return await checkCourseOfferingAccess(userId, offeringId, [
    COURSE_OFFERING_ROLES.INSTRUCTOR,
  ]);
};

// GET /course-offerings
export const getAllCourseOfferings = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const { role } = req.query;

  let courseOfferings;

  if (isAdmin) {
    // Admin can see all course offerings (without enrollments/settings for list view)
    courseOfferings = await prisma.courseOffering.findMany({
      include: {
        course: true,
        semester: true,
      },
    });

    // Add userRole for admin (they have access to everything)
    return res.json(
      courseOfferings.map((offering) => ({
        ...offering,
        userRole: SYSTEM_ROLES.ADMIN,
      })),
    );
  }

  // Regular users can only see offerings they're enrolled in (without enrollments/settings for list view)
  const enrollments = await prisma.courseOfferingEnrollment.findMany({
    where: {
      userId,
      ...(role && { role: role as CourseOfferingRole }),
    },
    include: {
      courseOffering: {
        include: {
          course: true,
          semester: true,
        },
      },
    },
  });

  courseOfferings = enrollments.map((enrollment) => ({
    ...enrollment.courseOffering,
    userRole: enrollment.role,
  }));

  return res.json(courseOfferings);
};

// GET /course-offerings/:offeringId
export const getCourseOffering = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);

  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
    include: {
      course: true,
      semester: true,
      enrollments: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
      teams: {
        include: {
          members: {
            include: {
              user: {
                select: { id: true, email: true },
              },
            },
          },
        },
      },
    },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  let userRole: string | null = null;

  if (!isAdmin) {
    // Check if user is enrolled
    const enrollment = await checkCourseOfferingAccess(userId, offeringId);
    if (!enrollment) {
      throw new ForbiddenError('Access denied to this course offering');
    }
    userRole = enrollment.role;
  } else {
    userRole = SYSTEM_ROLES.ADMIN;
  }

  // Check if user should have access to enrollments and settings
  const hasInstructorAccess =
    userRole === COURSE_OFFERING_ROLES.INSTRUCTOR ||
    userRole === SYSTEM_ROLES.ADMIN;

  // Omit enrollments and settings if user is not an instructor or admin
  const response = {
    ...courseOffering,
    userRole,
    ...(!hasInstructorAccess && { enrollments: undefined }),
    ...(!hasInstructorAccess && { settings: undefined }),
  };

  return res.json(response);
};

// POST /course-offerings
export const createCourseOffering = async (req: Request, res: Response) => {
  const { courseId, semesterId, settings = {} } = req.body;

  // Check if course and semester exist
  const [course, semester] = await Promise.all([
    prisma.course.findUnique({ where: { id: courseId } }),
    prisma.semester.findUnique({ where: { id: semesterId } }),
  ]);

  if (!course) {
    throw new NotFoundError('Course not found');
  }

  if (!semester) {
    throw new NotFoundError('Semester not found');
  }

  // Check if course offering already exists for this course and semester
  const existingOffering = await prisma.courseOffering.findUnique({
    where: {
      courseId_semesterId: {
        courseId,
        semesterId,
      },
    },
  });

  if (existingOffering) {
    throw new ConflictError(
      'Course offering already exists for this course and semester',
    );
  }

  const courseOffering = await prisma.courseOffering.create({
    data: {
      courseId,
      semesterId,
      settings,
    },
    include: {
      course: true,
      semester: true,
    },
  });

  return res.status(201).json(courseOffering);
};

// PUT /course-offerings/:offeringId
export const updateCourseOffering = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);
  const { settings } = req.body;

  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check permissions - admin or instructor of the offering
  if (!isAdmin) {
    const instructorAccess = await checkInstructorAccess(userId, offeringId);
    if (!instructorAccess) {
      throw new ForbiddenError(
        'Only instructors can update course offering settings',
      );
    }
  }

  const updatedOffering = await prisma.courseOffering.update({
    where: { id: offeringId },
    data: { settings },
    include: {
      course: true,
      semester: true,
    },
  });

  return res.json(updatedOffering);
};

// DELETE /course-offerings/:offeringId
export const deleteCourseOffering = async (req: Request, res: Response) => {
  const offeringId = parseInt(req.params.offeringId, 10);

  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
    include: {
      enrollments: true,
      teams: {
        include: {
          members: true,
        },
      },
    },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check if course offering has any enrollments or teams
  const hasEnrollments = courseOffering.enrollments.length > 0;
  const hasTeams = courseOffering.teams.length > 0;

  if (hasEnrollments || hasTeams) {
    const issues = [];
    if (hasEnrollments) {
      issues.push(`${courseOffering.enrollments.length} enrollment(s)`);
    }
    if (hasTeams) {
      issues.push(`${courseOffering.teams.length} team(s)`);
    }

    throw new ConflictError(
      `Cannot delete course offering. It has ${issues.join(' and ')} associated with it. Please remove all enrollments and teams first.`,
    );
  }

  await prisma.courseOffering.delete({
    where: { id: offeringId },
  });

  return res.status(204).send();
};
