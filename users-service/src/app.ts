import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middlewares/error-handler";
import authRoutes from "./modules/auth/auth.routes";
import healthRoutes from "./modules/health/health.routes";
import usersRoutes from "./modules/users/users.routes";
import { env } from "./config/env";

export const app = express();

app.use(
  cors({
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // For browser requests with credentials we must return a concrete origin (not "*").
      // Allow non-browser tools (no Origin header) as well.
      if (!origin) return callback(null, true);
      return callback(null, origin === env.FRONTEND_ORIGIN);
    },
    credentials: true,
    exposedHeaders: ["x-access-token"]
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/health", healthRoutes);
app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.use(errorHandler);
