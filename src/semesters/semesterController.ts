import type { Request, Response } from 'express';

import { prisma } from '../prisma.js';
import { NotFoundError } from '../utils/AppError.js';

export const getAllSemesters = async (_req: Request, res: Response) => {
  const semesters = await prisma.semester.findMany();
  return res.json(semesters);
};

export const getSemesterById = async (req: Request, res: Response) => {
  const semesterId = parseInt(req.params.semesterId, 10);

  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
  });

  if (!semester) {
    throw new NotFoundError('Semester not found');
  }

  return res.json(semester);
};

export const createSemester = async (req: Request, res: Response) => {
  const { season, year, startDate, endDate } = req.body;
  const newSemester = await prisma.semester.create({
    data: {
      season,
      year,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });
  return res.status(201).json(newSemester);
};

export const updateSemester = async (req: Request, res: Response) => {
  const semesterId = parseInt(req.params.semesterId, 10);
  const { season, year, startDate, endDate } = req.body;

  const existingSemester = await prisma.semester.findUnique({
    where: { id: semesterId },
  });

  if (!existingSemester) {
    throw new NotFoundError('Semester not found');
  }

  const updatedSemester = await prisma.semester.update({
    where: { id: semesterId },
    data: {
      season,
      year,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  });

  return res.json(updatedSemester);
};

export const deleteSemester = async (req: Request, res: Response) => {
  const semesterId = parseInt(req.params.semesterId, 10);

  const existingSemester = await prisma.semester.findUnique({
    where: { id: semesterId },
  });

  if (!existingSemester) {
    throw new NotFoundError('Semester not found');
  }

  await prisma.semester.delete({
    where: { id: semesterId },
  });

  return res.status(204).send();
};
