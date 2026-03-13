import { z } from "zod";

export const matchSchema = z.object({
  body: z.object({
    resumeId: z.string().uuid(),
    vacancyId: z.string().uuid()
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});
