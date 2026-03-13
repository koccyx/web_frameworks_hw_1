import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { AppError } from "../utils/app-error";

const getPrismaErrorCode = (error: unknown): string | null => {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }

  const { code } = error as { code?: unknown };
  return typeof code === "string" ? code : null;
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof SyntaxError && "status" in err) {
    const { status } = err as { status?: number };

    if (status === StatusCodes.BAD_REQUEST) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid JSON body"
      });
    }
  }

  if (err instanceof ZodError) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Validation error",
      errors: err.flatten()
    });
  }

  const prismaErrorCode = getPrismaErrorCode(err);
  if (prismaErrorCode === "P2002") {
    return res.status(StatusCodes.CONFLICT).json({
      message: "Resource already exists"
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  if (err instanceof Error) {
    console.error(err);
  } else {
    console.error("Unknown error:", err);
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "Internal server error"
  });
};
