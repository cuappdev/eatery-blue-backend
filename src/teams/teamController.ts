import type { Request, Response } from 'express';

import { COURSE_OFFERING_ROLES } from '../constants/roles.js';
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
  requiredRoles?: string[],
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

// GET /course-offerings/:offeringId/teams
export const getCourseOfferingTeams = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);

  // Check if course offering exists
  const courseOffering = await prisma.courseOffering.findUnique({
    where: { id: offeringId },
  });

  if (!courseOffering) {
    throw new NotFoundError('Course offering not found');
  }

  // Check if user has access to this course offering
  if (!isAdmin) {
    const hasAccess = await checkCourseOfferingAccess(userId, offeringId);
    if (!hasAccess) {
      throw new ForbiddenError('Access denied to this course offering');
    }
  }

  const teams = await prisma.team.findMany({
    where: { courseOfferingId: offeringId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  return res.json(teams);
};

// GET /teams/:teamId
export const getTeam = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const teamId = parseInt(req.params.teamId, 10);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
      CourseOffering: true,
    },
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  // Check if user has access to the course offering this team belongs to
  if (!isAdmin) {
    const hasAccess = await checkCourseOfferingAccess(
      userId,
      team.courseOfferingId,
    );
    if (!hasAccess) {
      throw new ForbiddenError('Access denied to this team');
    }
  }

  return res.json(team);
};

// POST /course-offerings/:offeringId/teams
export const createTeam = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const offeringId = parseInt(req.params.offeringId, 10);
  const { name, memberEmails } = req.body;

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
      throw new ForbiddenError('Only instructors can create teams');
    }
  }

  // Check if team name already exists
  const existingTeam = await prisma.team.findFirst({
    where: {
      name
    },
  });

  if (existingTeam) {
    throw new ConflictError('Team name already exists');
  }

  // Process member emails - create users if they don't exist and enroll them
  const memberUserIds = [];
  for (const email of memberEmails) {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Check if user is enrolled in course offering
    let enrollment = await prisma.courseOfferingEnrollment.findUnique({
      where: {
        userId_courseOfferingId: {
          userId: user.id,
          courseOfferingId: offeringId,
        },
      },
    });

    // If not enrolled, enroll as STUDENT
    if (!enrollment) {
      enrollment = await prisma.courseOfferingEnrollment.create({
        data: {
          userId: user.id,
          courseOfferingId: offeringId,
          role: COURSE_OFFERING_ROLES.STUDENT,
        },
      });
    }

    memberUserIds.push(user.id);
  }

  // Create team
  const team = await prisma.team.create({
    data: {
      name,
      courseOfferingId: offeringId,
      members: {
        create: memberUserIds.map((userId) => ({
          userId,
        })),
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
    },
  });

  return res.status(201).json(team);
};

// PUT /teams/:teamId
export const updateTeam = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const teamId = parseInt(req.params.teamId, 10);
  const { name, memberEmails } = req.body;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: true,
    },
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  // Check permissions - admin or instructor of the course offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(
      userId,
      team.courseOfferingId,
    );
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can update teams');
    }
  }

  // Check if new team name conflicts (if name is being changed)
  if (name && name !== team.name) {
    const existingTeam = await prisma.team.findFirst({
      where: {
        name,
        courseOfferingId: team.courseOfferingId,
        id: { not: teamId },
      },
    });

    if (existingTeam) {
      throw new ConflictError(
        'Team name already exists in this course offering',
      );
    }
  }

  // Process member emails if provided
  let memberUserIds: number[] | undefined;
  if (memberEmails) {
    memberUserIds = [];
    for (const email of memberEmails) {
      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: { email },
        });
      }

      // Check if user is enrolled in course offering
      let enrollment = await prisma.courseOfferingEnrollment.findUnique({
        where: {
          userId_courseOfferingId: {
            userId: user.id,
            courseOfferingId: team.courseOfferingId,
          },
        },
      });

      // If not enrolled, enroll as STUDENT
      if (!enrollment) {
        enrollment = await prisma.courseOfferingEnrollment.create({
          data: {
            userId: user.id,
            courseOfferingId: team.courseOfferingId,
            role: COURSE_OFFERING_ROLES.STUDENT,
          },
        });
      }

      memberUserIds.push(user.id);
    }
  }

  // Update team
  const updatedTeam = await prisma.team.update({
    where: { id: teamId },
    data: {
      ...(name && { name }),
      ...(memberUserIds && {
        members: {
          deleteMany: {},
          create: memberUserIds.map((userId) => ({
            userId,
          })),
        },
      }),
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
    },
  });

  return res.json(updatedTeam);
};

// DELETE /teams/:teamId
export const deleteTeam = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const teamId = parseInt(req.params.teamId, 10);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  // Check permissions - admin or instructor of the course offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(
      userId,
      team.courseOfferingId,
    );
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can delete teams');
    }
  }

  await prisma.team.delete({
    where: { id: teamId },
  });

  return res.status(204).send();
};

// POST /teams/:teamId/members
export const addTeamMembers = async (req: Request, res: Response) => {
  const { userId, isAdmin } = req.user!;
  const teamId = parseInt(req.params.teamId, 10);
  const { memberEmails } = req.body;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  // Check permissions - admin or instructor of the course offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(
      userId,
      team.courseOfferingId,
    );
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can add team members');
    }
  }

  // Process member emails
  const newMemberUserIds = [];
  const existingMemberEmails = team.members.map((member) => member.user.email);

  for (const email of memberEmails) {
    // Check if user is already a member
    if (existingMemberEmails.includes(email)) {
      throw new ConflictError(`User ${email} is already a member of this team`);
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email },
      });
    }

    // Check if user is enrolled in course offering
    let enrollment = await prisma.courseOfferingEnrollment.findUnique({
      where: {
        userId_courseOfferingId: {
          userId: user.id,
          courseOfferingId: team.courseOfferingId,
        },
      },
    });

    // If not enrolled, enroll as STUDENT
    if (!enrollment) {
      enrollment = await prisma.courseOfferingEnrollment.create({
        data: {
          userId: user.id,
          courseOfferingId: team.courseOfferingId,
          role: COURSE_OFFERING_ROLES.STUDENT,
        },
      });
    }

    newMemberUserIds.push(user.id);
  }

  // Add new members to team
  await prisma.teamMembership.createMany({
    data: newMemberUserIds.map((userId) => ({
      userId,
      teamId,
    })),
  });

  // Return updated team
  const updatedTeam = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true },
          },
        },
      },
    },
  });

  return res.json(updatedTeam);
};

// DELETE /teams/:teamId/members/:userId
export const removeTeamMember = async (req: Request, res: Response) => {
  const { userId: currentUserId, isAdmin } = req.user!;
  const teamId = parseInt(req.params.teamId, 10);
  const targetUserId = parseInt(req.params.userId, 10);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  if (!team) {
    throw new NotFoundError('Team not found');
  }

  // Check permissions - admin or instructor of the course offering
  if (!isAdmin) {
    const isInstructor = await checkInstructorAccess(
      currentUserId,
      team.courseOfferingId,
    );
    if (!isInstructor) {
      throw new ForbiddenError('Only instructors can remove team members');
    }
  }

  // Check if user is actually a member of the team
  const membership = await prisma.teamMembership.findUnique({
    where: {
      userId_teamId: {
        userId: targetUserId,
        teamId,
      },
    },
  });

  if (!membership) {
    throw new NotFoundError('User is not a member of this team');
  }

  await prisma.teamMembership.delete({
    where: {
      userId_teamId: {
        userId: targetUserId,
        teamId,
      },
    },
  });

  return res.status(204).send();
};
