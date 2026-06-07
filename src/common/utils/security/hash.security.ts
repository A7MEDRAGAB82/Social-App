import bcrypt from "bcrypt";
import { env } from "../../../config/env.service";

interface HashOptions {
  plainText: string;
  salt?: string;
}

export const generateHash = async ({
  plainText,
  salt = env.saltRounds,
}: HashOptions): Promise<string> => {
  return bcrypt.hash(plainText, parseInt(salt, 10));
};

export const compareHash = async ({
  plainText,
  hash,
}: {
  plainText: string;
  hash: string;
}): Promise<boolean> => {
  return bcrypt.compare(plainText, hash);
};
