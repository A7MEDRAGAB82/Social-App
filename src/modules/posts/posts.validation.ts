import { z } from "zod";

export const createPostSchema = {
  body: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters"),
    content: z.string().min(1, "Content is required"),
    attachments: z
      .array(z.string().url("Each attachment must be a valid URL"))
      .default([]),
  }),
};

export const updatePostSchema = {
  body: z
    .object({
      title: z
        .string()
        .min(1, "Title is required")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
      content: z.string().min(1, "Content is required").optional(),
      attachments: z
        .array(z.string().url("Each attachment must be a valid URL"))
        .optional(),
    })
    .refine(
      (data) =>
        data.title !== undefined ||
        data.content !== undefined ||
        data.attachments !== undefined,
      { message: "At least one field is required to update" }
    ),
};

export const getPostsQuerySchema = {
  query: z.object({
    skip: z.coerce.number().int().min(0).default(0),
    limit: z.coerce.number().int().min(1).max(100).default(10),
  }),
};

export const postIdParamSchema = {
  params: z.object({
    id: z.string().min(1, "Post id is required"),
  }),
};

export const updatePostRequestSchema = {
  ...postIdParamSchema,
  ...updatePostSchema,
};
