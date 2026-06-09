import { Request } from 'express';
import { TokenService } from '../common/services/token.service';
import { redisService } from '../common/services/redis.service';

export interface GraphQLUser {
  id: string;
  email: string;
}

export interface GraphQLContext {
  user?: GraphQLUser;
  req: Request;
}

const tokenService = new TokenService();

export const buildGraphQLContext = async (req: Request): Promise<GraphQLContext> => {
  const context: GraphQLContext = { req };

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return context;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return context;
  }

  try {
    const decoded = tokenService.verifyAccessToken(token) as { id: string; email: string };
    const isRevoked = await redisService.get(`revoked_token:${token}`);
    
    if (!isRevoked) {
      context.user = decoded;
    }
  } catch (error) {
  }

  return context;
};
