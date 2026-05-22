import jwt from 'jsonwebtoken';
import { env } from '../../config/env.service';

export class TokenService {
    constructor() {}

    generateTokens(payload: object): { accessToken: string; refreshToken: string } {
        const accessToken = jwt.sign(payload, env.JWT_SECRET_KEY, { 
            expiresIn: '15m' 
        });
        
        const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET_KEY, { 
            expiresIn: '7d' 
        });

        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): jwt.JwtPayload | string {
        return jwt.verify(token, env.JWT_SECRET_KEY);
    }

    verifyRefreshToken(token: string): jwt.JwtPayload | string {
        return jwt.verify(token, env.JWT_REFRESH_SECRET_KEY);
    }

    decodeAccessToken(token: string): jwt.JwtPayload | null {
        return jwt.decode(token) as jwt.JwtPayload;
    }
}