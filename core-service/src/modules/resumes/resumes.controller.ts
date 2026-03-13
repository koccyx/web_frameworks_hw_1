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

export const createResume = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  const resume = await prisma.resume.create({
    data: {
      userId,
      title: req.body.title,
      rawText: req.body.rawText
    }
  });

  return res.status(StatusCodes.CREATED).json(resume);
};

export const listResumes = async (req: Request, res: Response) => {
  const userId = getUserId(req);

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });

  return res.json(resumes);
};

export const getResumeById = async (req: Request, res: Response) => {
  const resumeId = getIdParam(req);
  const userId = getUserId(req);

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId
    }
  });

  if (!resume) {
    throw new AppError("Resume not found", StatusCodes.NOT_FOUND);
  }

  return res.json(resume);
};

export const updateResume = async (req: Request, res: Response) => {
  const resumeId = getIdParam(req);
  const userId = getUserId(req);

  const existingResume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId
    }
  });

  if (!existingResume) {
    throw new AppError("Resume not found", StatusCodes.NOT_FOUND);
  }

  const resume = await prisma.resume.update({
    where: { id: existingResume.id },
    data: req.body
  });

  return res.json(resume);
};

export const deleteResume = async (req: Request, res: Response) => {
  const resumeId = getIdParam(req);
  const userId = getUserId(req);

  const existingResume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId
    }
  });

  if (!existingResume) {
    throw new AppError("Resume not found", StatusCodes.NOT_FOUND);
  }

  await prisma.resume.delete({
    where: { id: existingResume.id }
  });

  return res.status(StatusCodes.NO_CONTENT).send();
};
