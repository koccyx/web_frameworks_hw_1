import { z } from "zod";

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    rawText: z.string().min(1)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const updateResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    rawText: z.string().min(1).optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  }),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});

export const resumeIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: z.string().uuid()
  }),
  query: z.object({}).default({})
});

