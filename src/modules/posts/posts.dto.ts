import { z } from "zod";
import {
  createPostSchema,
  getPostsQuerySchema,
  postIdParamSchema,
  updatePostSchema,
} from "./posts.validation";

export type CreatePostDto = z.infer<typeof createPostSchema.body>;
export type UpdatePostDto = z.infer<typeof updatePostSchema.body>;
export type GetPostsQueryDto = z.infer<typeof getPostsQuerySchema.query>;
export type PostIdParamDto = z.infer<typeof postIdParamSchema.params>;
