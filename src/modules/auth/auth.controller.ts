import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { signupSchema, loginSchema, googleSignupSchema, forgetPasswordSchema, resetPasswordSchema, updatePasswordSchema } from "./auth.validation";
import { validateRequest } from "../../middleware/validation.middleware";
import { successResponse } from "../../common/success/success.response";
import { BadRequestException } from "../../common/exceptions/application.exception";
import { authMiddleware } from "../../middleware/auth.middleware";

const router: Router = Router();


router.post(
  "/signup",
  validateRequest(signupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.signup(data);
      successResponse({
        res,
        message: "User registered successfully. Please check your email for verification code.",
        statusCode: 201,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/login",
  validateRequest(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.login(data);
      successResponse({
        res,
        message: "User logged in successfully",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/verify-email",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code } = req.query;
      if (typeof userId !== "string" || typeof code !== "string") {
        throw new BadRequestException(
          "Invalid query parameters: userId and code must be strings"
        );
      }
      const result = await authService.verifyEmail(userId, code);
      successResponse({
        res,
        message: result.message,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/signup-mail",
  validateRequest(googleSignupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.signupMail(data);
      successResponse({
        res,
        message: "User registered/logged in successfully via Google",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/logout",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        throw new BadRequestException("Authorization header missing");
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw new BadRequestException("Token missing");
      }

      const result = await authService.logout(token);
      successResponse({
        res,
        message: result.message,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/forget-password",
  validateRequest(forgetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.forgetPassword(data);
      successResponse({
        res,
        message: result.message,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.resetPassword(data);
      successResponse({
        res,
        message: result.message,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.post(
  "/update-password",
  authMiddleware,
  validateRequest(updatePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        throw new BadRequestException("User ID not found in token");
      }

      const data = req.body;
      const result = await authService.updatePassword(userId, data);
      successResponse({
        res,
        message: result.message,
        statusCode: 200,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;