import { Router } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { matchSchema } from "./match.schemas";
import { calculateHeuristicMatch, calculateLlmMatch } from "./match.service";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /match:
 *   post:
 *     tags:
 *       - Match
 *     summary: Compare resume and vacancy using AI feedback
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resumeId, vacancyId]
 *             properties:
 *               resumeId:
 *                 type: string
 *                 format: uuid
 *               vacancyId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI match result with resume improvement feedback
 */
router.post(
  "/",
  validate(matchSchema),
  asyncHandler(async (req, res) => {
    const userId = req.user?.sub;
    const { resumeId, vacancyId } = req.body;

    if (!userId) {
      throw new AppError("Unauthorized", StatusCodes.UNAUTHORIZED);
    }

    const [resume, vacancy] = await Promise.all([
      prisma.resume.findUnique({
        where: { id: resumeId }
      }),
      prisma.vacancy.findUnique({
        where: { id: vacancyId }
      })
    ]);

    if (!resume || !vacancy) {
      throw new AppError("Resume or vacancy not found", StatusCodes.NOT_FOUND);
    }

    try {
      return res.json(await calculateLlmMatch(resume.rawText, vacancy.rawText));
    } catch (error) {
      console.error("OpenRouter match failed, fallback to heuristic:", error);
      return res.json(calculateHeuristicMatch(resume.rawText, vacancy.rawText));
    }
  })
);

export default router;
