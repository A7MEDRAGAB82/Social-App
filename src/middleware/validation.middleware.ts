import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import  ApplicationException  from '../common/exceptions/application.exception';

/**
 * Validation middleware configuration
 * Allows validating request body, query, and params with separate Zod schemas
 */
interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

/**
 * Higher-order validation middleware using Zod
 * 
 * Usage: app.post('/users', validateRequest({ body: createUserSchema }), controller)
 * 
 * @param schemas - Object containing optional body, query, and params Zod schemas
 * @returns Express middleware function
 */
export const validateRequest = (schemas: ValidationSchemas) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (schemas.body) {
        const parsedBody = await schemas.body.safeParseAsync(req.body);
        if (!parsedBody.success) {
          const errorMessage = parsedBody.error.issues[0]?.message || 'Invalid request body';
          throw new ApplicationException(errorMessage, 400, parsedBody.error);
        }
        req.body = parsedBody.data;
      }

      if (schemas.query) {
        const parsedQuery = await schemas.query.safeParseAsync(req.query);
        if (!parsedQuery.success) {
          const errorMessage = parsedQuery.error.issues[0]?.message || 'Invalid query parameters';
          throw new ApplicationException(errorMessage, 400, parsedQuery.error);
        }
       req.query = parsedQuery.data as any;
      }

      if (schemas.params) {
        const parsedParams = await schemas.params.safeParseAsync(req.params);
        if (!parsedParams.success) {
          const errorMessage = parsedParams.error.issues[0]?.message || 'Invalid route parameters';
          throw new ApplicationException(errorMessage, 400, parsedParams.error);
        }
        req.params = parsedParams.data as any;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
