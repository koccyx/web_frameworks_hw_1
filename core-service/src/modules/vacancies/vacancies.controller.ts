import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/app-error";

const getIdParam = (req: Request): string =>
  Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

const getUserId = (req: Request): string => {
  const userId = req.user?.sub;

  if (!userId) {
    throw new AppError("Unauthorized", StatusCodes.UNAUTHORIZED);
  }

  return userId;
};

const isAdmin = (req: Request): boolean => req.user?.role === "admin";

const ensureCanManageVacancy = async (req: Request, vacancyId: string) => {
  const vacancy = await prisma.vacancy.findUnique({
    where: { id: vacancyId }
  });

  if (!vacancy) {
    throw new AppError("Vacancy not found", StatusCodes.NOT_FOUND);
  }

  if (!isAdmin(req) && vacancy.userId !== getUserId(req)) {
    throw new AppError("Forbidden", StatusCodes.FORBIDDEN);
  }

  return vacancy;
};

export const createVacancy = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  const vacancy = await prisma.vacancy.create({
    data: {
      userId,
      title: req.body.title,
      company: req.body.company,
      rawText: req.body.rawText
    }
  });

  return res.status(StatusCodes.CREATED).json(vacancy);
};

export const listVacancies = async (req: Request, res: Response) => {
  getUserId(req);

  const vacancies = await prisma.vacancy.findMany({
    orderBy: { createdAt: "desc" }
  });

  return res.json(vacancies);
};

export const getVacancyById = async (req: Request, res: Response) => {
  const vacancyId = getIdParam(req);
  getUserId(req);

  const vacancy = await prisma.vacancy.findUnique({
    where: {
      id: vacancyId
    }
  });

  if (!vacancy) {
    throw new AppError("Vacancy not found", StatusCodes.NOT_FOUND);
  }

  return res.json(vacancy);
};

export const updateVacancy = async (req: Request, res: Response) => {
  const vacancyId = getIdParam(req);
  const existingVacancy = await ensureCanManageVacancy(req, vacancyId);

  const vacancy = await prisma.vacancy.update({
    where: { id: existingVacancy.id },
    data: req.body
  });

  return res.json(vacancy);
};

export const deleteVacancy = async (req: Request, res: Response) => {
  const vacancyId = getIdParam(req);
  const existingVacancy = await ensureCanManageVacancy(req, vacancyId);

  await prisma.vacancy.delete({
    where: { id: existingVacancy.id }
  });

  return res.status(StatusCodes.NO_CONTENT).send();
};
