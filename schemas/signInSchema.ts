import { z } from 'zod'

export const signInSchema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(6),
});