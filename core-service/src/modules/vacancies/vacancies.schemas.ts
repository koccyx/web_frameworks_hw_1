import { z } from "zod";

export const createVacancySchema = z.object({
  body: z.object({
    title: z.string().min(1),
    company: z.string().min(1),
    rawText: z.string().min(1)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateVacancySchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    company: z.string().min(1).optional(),
    rawText: z.string().min(1).optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});

export const vacancyIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});

