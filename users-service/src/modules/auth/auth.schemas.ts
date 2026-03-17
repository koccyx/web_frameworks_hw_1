import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string().min(1).default("user")
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6)
  }),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

export const refreshSchema = z.object({
  body: z
    .object({
      refreshToken: z.string().min(1).optional()
    })
    .default({}),
  params: z.object({}).default({}),
  query: z.object({}).default({})
});

