import { z } from "zod"

export const signUpSchema = z.object({
    indentifier: z.string(),
    password: z.string(),
})