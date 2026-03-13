import { Router } from "express";
import { requireAuth } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/async-handler";
import {
  createVacancy,
  deleteVacancy,
  getVacancyById,
  listVacancies,
  updateVacancy
} from "./vacancies.controller";
import { createVacancySchema, updateVacancySchema, vacancyIdSchema } from "./vacancies.schemas";

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /vacancies:
 *   get:
 *     tags:
 *       - Vacancies
 *     summary: List current user's vacancies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vacancies list
 */
router.get("/", asyncHandler(listVacancies));

/**
 * @openapi
 * /vacancies:
 *   post:
 *     tags:
 *       - Vacancies
 *     summary: Create vacancy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, company, rawText]
 *             properties:
 *               title:
 *                 type: string
 *               company:
 *                 type: string
 *               rawText:
 *                 type: string
 *     responses:
 *       201:
 *         description: Vacancy created
 */
router.post("/", validate(createVacancySchema), asyncHandler(createVacancy));

/**
 * @openapi
 * /vacancies/{id}:
 *   get:
 *     tags:
 *       - Vacancies
 *     summary: Get vacancy by id
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
 *         description: Vacancy details
 */
router.get("/:id", validate(vacancyIdSchema), asyncHandler(getVacancyById));

/**
 * @openapi
 * /vacancies/{id}:
 *   patch:
 *     tags:
 *       - Vacancies
 *     summary: Update vacancy
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
 *         description: Vacancy updated
 */
router.patch("/:id", validate(updateVacancySchema), asyncHandler(updateVacancy));

/**
 * @openapi
 * /vacancies/{id}:
 *   delete:
 *     tags:
 *       - Vacancies
 *     summary: Delete vacancy
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
 *         description: Vacancy deleted
 */
router.delete("/:id", validate(vacancyIdSchema), asyncHandler(deleteVacancy));

export default router;

