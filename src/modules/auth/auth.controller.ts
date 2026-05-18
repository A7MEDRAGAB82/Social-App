import { Router } from "express";
import type { Request , Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { signupSchema, loginSchema } from "./auth.validation";
import { validateRequest } from "../../middleware/validation.middleware";
import { successResponse } from "../../common/success/success.response";
import { BadRequestException } from "../../common/exceptions/application.exception";

const router : Router = Router();


router.post(
  "/signup",
  validateRequest(signupSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const result = await authService.signup(data);
      successResponse({
        res,
        message: "User registered successfully",
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

router.get("/verify-email", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, code } = req.query;
      if (typeof userId !== 'string' || typeof code !== 'string') {
        throw new BadRequestException('Invalid query parameters');
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
});




export default router;