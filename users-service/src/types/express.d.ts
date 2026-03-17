import type { JwtPayload } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }

    interface Cookies {
      refreshToken?: string;
    }
  }
}

export {};

