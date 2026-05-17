import z from "zod";
import { signupSchema, loginSchema } from "./auth.validation";

export type signupDTO = z.infer<typeof signupSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>;