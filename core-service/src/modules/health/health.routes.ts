import { Router } from "express";

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Service health check
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "core-service" });
});

export default router;

