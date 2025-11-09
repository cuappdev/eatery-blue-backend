import type { CourseOfferingRole } from '@prisma/client';

import type { Request, Response } from 'express';

import { COURSE_OFFERING_ROLES } from '../constants/roles.js';
import { prisma } from '../prisma.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/AppError.js';

// Helper function to check if user is instructor of course offering
const checkInstructorAccess = async (userId: number, offeringId: number) => {
  const enrollment = await prisma.courseOfferingEnrollment.findUnique({
    where: {
      userId_courseOfferingId: {
        userId,
        courseOfferingId: offeringId,
      },
    },
  });

  return enrollment && enrollment.role === COURSE_OFFERING_ROLES.INSTRUCTOR;
};

// GET /course-offerings/:offeringId/enrollments
export const getCourseOfferingEnrollments = async (
  req: Request,
  res: Response,
) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);

  // Check if course offering exists
  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check permissions - admin or instructor of the offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(userId, offeringId);
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can view enrollments');
    }
  }

  const enrollments = await prisma.courseOfferingEnrollment.findMany({
    where: { courseOfferingId: offeringId },
    include: {
      user: {
        select: { id: true, email: true, name: true, createdAt: true },
      },
    },
  });

  return res.json(enrollments);
};

// POST /course-offerings/:offeringId/enrollments
export const createCourseOfferingEnrollments = async (
  req: Request,
  res: Response,
) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);
  const { enrollments } = req.body;

  // Check if course offering exists
  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check permissions - admin or instructor of the offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(userId, offeringId);
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can manage enrollments');
    }
  }

  const createdEnrollments = [];

  for (const enrollment of enrollments) {
    const { email, role } = enrollment;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseOfferingEnrollment.findUnique(
      {
        where: {
          userId_courseOfferingId: {
            userId: user.id,
            courseOfferingId: offeringId,
          },
        },
      },
    );

    if (existingEnrollment) {
      throw new ConflictError(
        `User ${email} is already enrolled in this course offering`,
      );
    }

    // Create enrollment
    const newEnrollment = await prisma.courseOfferingEnrollment.create({
      data: {
        userId: user.id,
        courseOfferingId: offeringId,
        role: role as CourseOfferingRole,
      },
      include: {
        user: {
          select: { id: true, email: true, createdAt: true },
        },
      },
    });

    createdEnrollments.push(newEnrollment);
  }

  return res.status(201).json(createdEnrollments);
};

// PUT /course-offerings/:offeringId/enrollments/:userId
export const updateCourseOfferingEnrollment = async (
  req: Request,
  res: Response,
) => {
  const { userId: currentUserId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);
  const targetUserId = parseInt(req.params.userId, 10);
  const { role } = req.body;

  // Check if course offering exists
  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check permissions - admin or instructor of the offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(currentUserId, offeringId);
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can update enrollments');
    }
  }

  // Check if enrollment exists
  const existingEnrollment = await prisma.courseOfferingEnrollment.findUnique({
    where: {
      userId_courseOfferingId: {
        userId: targetUserId,
        courseOfferingId: offeringId,
      },
    },
  });

  if (!existingEnrollment) {
    throw new NotFoundError('Enrollment not found');
  }

  const updatedEnrollment = await prisma.courseOfferingEnrollment.update({
    where: {
      userId_courseOfferingId: {
        userId: targetUserId,
        courseOfferingId: offeringId,
      },
    },
    data: { role: role as CourseOfferingRole },
    include: {
      user: {
        select: { id: true, email: true, createdAt: true },
      },
    },
  });

  return res.json(updatedEnrollment);
};

// DELETE /course-offerings/:offeringId/enrollments/:userId
export const deleteCourseOfferingEnrollment = async (
  req: Request,
  res: Response,
) => {
  const { userId: currentUserId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);
  const targetUserId = parseInt(req.params.userId, 10);

  // Check if course offering exists
  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check permissions - admin or instructor of the offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(currentUserId, offeringId);
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can remove enrollments');
    }
  }

  // Check if enrollment exists
  const existingEnrollment = await prisma.courseOfferingEnrollment.findUnique({
    where: {
      userId_courseOfferingId: {
        userId: targetUserId,
        courseOfferingId: offeringId,
      },
    },
  });

  if (!existingEnrollment) {
    throw new NotFoundError('Enrollment not found');
  }

  await prisma.courseOfferingEnrollment.delete({
    where: {
      userId_courseOfferingId: {
        userId: targetUserId,
        courseOfferingId: offeringId,
      },
    },
  });

  await prisma.teamMembership.deleteMany({
    where: {
      userId: targetUserId,
      team: {
        courseOfferingId: offeringId,
      },
    },
  });

  return res.status(204).send();
};
