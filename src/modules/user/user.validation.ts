import { z } from "zod";

const imageContentTypeSchema = z
  .string()
  .min(1, "Content type is required")
  .regex(/^image\/(jpeg|jpg|png|webp|gif)$/i, "Only image files are allowed");

const fileNameSchema = z
  .string()
  .min(1, "File name is required")
  .max(255, "File name is too long");

export const presignUploadSchema = {
  body: z.object({
    fileName: fileNameSchema,
    contentType: imageContentTypeSchema,
  }),
};

export const confirmUploadSchema = {
  body: z.object({
    key: z.string().min(1, "S3 object key is required"),
  }),
};
