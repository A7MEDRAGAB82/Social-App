import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../common/services/token.service';
import { redisService } from '../common/services/redis.service';

const tokenService = new TokenService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = tokenService.verifyAccessToken(token) as { id: string; email: string };
        const isRevoked = await redisService.get(`revoked_token:${token}`);
        if (isRevoked) {
            return res.status(401).json({ message: 'Token has been revoked (Logged out)' });
        }

        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};