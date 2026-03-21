import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"]
  }) as JwtPayload;

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, {
    algorithms: ["HS256"]
  }) as JwtPayload;
