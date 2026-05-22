import z from "zod";
import { signupSchema, loginSchema, googleSignupSchema, forgetPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "./auth.validation";

export type signupDTO = z.infer<typeof signupSchema.body>;
export type loginDTO = z.infer<typeof loginSchema.body>;
export type GoogleSignupDTO = z.infer<typeof googleSignupSchema.body>;
export type ForgetPasswordDTO = z.infer<typeof forgetPasswordSchema.body>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema.body>;
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema.body>;


export interface IGoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number;
  exp: number;
}


export interface IPasswordResetToken {
  userId: string;
  email: string;
  token: string;
}