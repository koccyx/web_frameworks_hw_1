import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required", StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
  }
};

