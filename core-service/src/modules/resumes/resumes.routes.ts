import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/async-handler";
import {
  createResume,
  deleteResume,
  getResumeById,
  listResumes,
  updateResume
} from "./resumes.controller";
import { createResumeSchema, resumeIdSchema, updateResumeSchema } from "./resumes.schemas";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /resumes:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: List current user's resumes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumes list
 */
router.get("/", asyncHandler(listResumes));

/**
 * @openapi
 * /resumes:
 *   post:
 *     tags:
 *       - Resumes
 *     summary: Create resume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, rawText]
 *             properties:
 *               title:
 *                 type: string
 *               rawText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Resume created
 */
router.post("/", validate(createResumeSchema), asyncHandler(createResume));

/**
 * @openapi
 * /resumes/{id}:
 *   get:
 *     tags:
 *       - Resumes
 *     summary: Get resume by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resume details
 */
router.get("/:id", validate(resumeIdSchema), asyncHandler(getResumeById));

/**
 * @openapi
 * /resumes/{id}:
 *   patch:
 *     tags:
 *       - Resumes
 *     summary: Update resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resume updated
 */
router.patch("/:id", validate(updateResumeSchema), asyncHandler(updateResume));

/**
 * @openapi
 * /resumes/{id}:
 *   delete:
 *     tags:
 *       - Resumes
 *     summary: Delete resume
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Resume deleted
 */
router.delete("/:id", validate(resumeIdSchema), asyncHandler(deleteResume));

export default router;

