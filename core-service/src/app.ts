import cors from "cors";
import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import { errorHandler } from "./middlewares/error-handler";
import healthRoutes from "./modules/health/health.routes";
import matchRoutes from "./modules/match/match.routes";
import resumesRoutes from "./modules/resumes/resumes.routes";
import vacanciesRoutes from "./modules/vacancies/vacancies.routes";
import { env } from "./config/env";

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/health", healthRoutes);
app.use("/resumes", resumesRoutes);
app.use("/vacancies", vacanciesRoutes);
app.use("/match", matchRoutes);

app.use(errorHandler);

