import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { NotFoundError } from '../utils/AppError.js';

export const getAllCourses = async (_req: Request, res: Response) => {
  const courses = await prisma.course.findMany();
  return res.json(courses);
};

export const getCourseById = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId, 10);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      name: true,
      number: true,
      department: true,
      createdAt: true,
      offerings: {
        select: {
          id: true,
          semester: {
            select: {
              id: true,
              season: true,
              year: true,
              startDate: true,
              endDate: true,
            },
          },
          settings: true,
          enrollments: {
            select: {
              user: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new NotFoundError('Course not found');
  }

  return res.json(course);
};

export const createCourse = async (req: Request, res: Response) => {
  const { name, number, department } = req.body;
  const newCourse = await prisma.course.create({
    data: { name, number, department },
  });
  return res.status(201).json(newCourse);
};

export const updateCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId, 10);
  const { name, number, department } = req.body;

  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!existingCourse) {
    throw new NotFoundError('Course not found');
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: { name, number, department },
  });

  return res.json(updatedCourse);
};

export const deleteCourse = async (req: Request, res: Response) => {
  const courseId = parseInt(req.params.courseId, 10);

  const existingCourse = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!existingCourse) {
    throw new NotFoundError('Course not found');
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  return res.status(204).send();
};
