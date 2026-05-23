import bcrypt from 'bcrypt';
import { env } from '../../../config/env.service';

export const generateHash = async (p0: { plainText: string; }, saltRounds: string, { plainText, salt = env.saltRounds }: { plainText: string; salt: string; }) : Promise<string> => {
    return await bcrypt.hash(plainText, parseInt(salt));
};

export const compareHash = async ({plainText, hash}: { plainText: string; hash: string }) : Promise<boolean> => {
    return await bcrypt.compare(plainText, hash);
}