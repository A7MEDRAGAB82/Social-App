import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { postsService } from "./posts.service";
import {
  createPostSchema,
  getPostsQuerySchema,
  postIdParamSchema,
  updatePostRequestSchema,
} from "./posts.validation";
import type {
  CreatePostDto,
  GetPostsQueryDto,
  PostIdParamDto,
  UpdatePostDto,
} from "./posts.dto";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { successResponse } from "../../common/success/success.response";
import { BadRequestException } from "../../common/exceptions/application.exception";

const router: Router = Router();

router.get(
  "/",
  validateRequest(getPostsQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { skip, limit } = req.query as unknown as GetPostsQueryDto;
      const result = await postsService.getPosts(skip, limit);

      successResponse({
        res,
        message: "Posts retrieved successfully",
        statusCode: 200,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id",
  validateRequest(postIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as unknown as PostIdParamDto;
      const post = await postsService.getPostById(id);

      successResponse({
        res,
        message: "Post retrieved successfully",
        statusCode: 200,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  authMiddleware,
  validateRequest(createPostSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("User ID not found in token");
      }

      const data = req.body as unknown as CreatePostDto;
      const post = await postsService.createPost(req.user.id, data);

      successResponse({
        res,
        message: "Post created successfully",
        statusCode: 201,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  validateRequest(updatePostRequestSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("User ID not found in token");
      }

      const { id } = req.params as unknown as PostIdParamDto;
      const data = req.body as unknown as UpdatePostDto;
      const post = await postsService.updatePost(id, req.user.id, data);

      successResponse({
        res,
        message: "Post updated successfully",
        statusCode: 200,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  authMiddleware,
  validateRequest(postIdParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.id) {
        throw new BadRequestException("User ID not found in token");
      }

      const { id } = req.params as unknown as PostIdParamDto;
      const post = await postsService.softDeletePost(id, req.user.id);

      successResponse({
        res,
        message: "Post deleted successfully",
        statusCode: 200,
        data: post,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
