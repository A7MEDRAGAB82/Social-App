import { Request, Response, NextFunction } from 'express';
import  ApplicationException  from '../common/exceptions/application.exception';

/**
 * Global Error Handling Middleware
 * 
 * This middleware catches all errors passed via next(error) and:
 * 1. Extracts statusCode and message from ApplicationException
 * 2. Defaults to 500 for unexpected errors
 * 3. Includes stack trace only in development mode
 * 4. Logs errors for debugging
 * 5. Sends consistent error response format
 */
export const errorMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'An unexpected error occurred';

  if (error instanceof ApplicationException) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    message = error.message || 'An unexpected error occurred';
  }

  console.error(error);

  const response: {
    success: boolean;
    message: string;
    stack?: string;
  } = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};