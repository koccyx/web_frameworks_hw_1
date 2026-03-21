import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../../utils/jwt";

const REFRESH_COOKIE_NAME = "refreshToken";

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

const refreshCookieOptions = (req: Request) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production" ? true : req.secure,
  path: "/auth/refresh"
});

export const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("Email is already registered", StatusCodes.CONFLICT);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role
    }
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(req));

  return res.status(StatusCodes.CREATED).json({
    token: accessToken,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = signRefreshToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions(req));

  return res.json({
    token: accessToken,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken =
    getCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME) ??
    ((req.body as { refreshToken?: string } | undefined)?.refreshToken as string | undefined);

  if (!refreshToken) {
    throw new AppError("Refresh token is required", StatusCodes.UNAUTHORIZED);
  }

  let decoded: unknown;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token", StatusCodes.UNAUTHORIZED);
  }

  const payload = decoded as { sub: string; email: string; role: string };
  const cleanPayload = {
    sub: payload.sub,
    email: payload.email,
    role: payload.role
  };

  const accessToken = signAccessToken(cleanPayload);
  const newRefreshToken = signRefreshToken(cleanPayload);

  res.cookie(REFRESH_COOKIE_NAME, newRefreshToken, refreshCookieOptions(req));

  return res.json({
    token: accessToken,
    accessToken,
    refreshToken: newRefreshToken
  });
};
