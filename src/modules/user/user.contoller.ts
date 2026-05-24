import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { successResponse } from "../../common/success/success.response";
import { uploadFile } from "../../common/utils/multer/cloud";
import { BadRequestException } from "../../common/exceptions/application.exception";
import { s3Service } from "../../common/services/s3.service";

const router: Router = Router();

const memoryUpload = uploadFile();

const uploadUserImage = async (
  userId: string,
  file: Express.Multer.File,
  folder: "profile-pictures" | "cover-pictures"
): Promise<string> => {
  const key = s3Service.buildUserImageKey(userId, folder, file.originalname);

  return s3Service.upload({
    buffer: file.buffer,
    key,
    contentType: file.mimetype,
  });
};

router.get(
  "/profile",
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = await userService.getUserProfile(req.user?.id as string);

      successResponse({
        res,
        message: "User profile retrieved successfully",
        statusCode: 200,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/profile",
  authMiddleware,
  memoryUpload.single("profilePicture"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id as string;
      const updateData: Partial<typeof req.body> = { ...req.body };

      if (req.file) {
        updateData.profilePicture = await uploadUserImage(
          userId,
          req.file,
          "profile-pictures"
        );
      }

      const userData = await userService.updateUserProfile(userId, updateData);

      successResponse({
        res,
        message: "User profile updated successfully",
        statusCode: 200,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/profile/cover",
  authMiddleware,
  memoryUpload.single("profileCoverPicture"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestException("Cover picture file is required");
      }

      const userId = req.user?.id as string;
      const coverUrl = await uploadUserImage(
        userId,
        req.file,
        "cover-pictures"
      );

      const userData = await userService.updateProfileCoverPicture(
        userId,
        coverUrl
      );

      successResponse({
        res,
        message: "Profile cover picture updated successfully",
        statusCode: 200,
        data: userData,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
