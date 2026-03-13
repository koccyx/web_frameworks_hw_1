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

