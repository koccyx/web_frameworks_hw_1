import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";
import { signAccessToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt";

const REFRESH_COOKIE_NAME = "refreshToken";
const ACCESS_TOKEN_HEADER = "x-access-token";

const getCookieValue = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) {
    return undefined;
  }

  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError("Authorization token is required", StatusCodes.UNAUTHORIZED));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    if (!(error instanceof jwt.TokenExpiredError)) {
      return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }

    const refreshToken = getCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME);

    if (!refreshToken) {
      return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }

    try {
      const refreshPayload = verifyRefreshToken(refreshToken);
      const nextAccessToken = signAccessToken(refreshPayload);

      req.user = refreshPayload;
      res.setHeader(ACCESS_TOKEN_HEADER, nextAccessToken);

      return next();
    } catch {
      return next(new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED));
    }
  }
};
