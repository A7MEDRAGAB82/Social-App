import z from "zod";
import { signupSchema } from "./auth.validation";




export type signupDTO = z.infer<typeof signupSchema.body>;