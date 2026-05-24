import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { successResponse } from "../../common/success/success.response";
import { getPublicUploadPath, uploadFile } from "../../common/utils/multer/cloud";
import { MulterEnum } from "../../common/enums/multer.enum";
import { BadRequestException } from "../../common/exceptions/application.exception";

const router: Router = Router();

const diskUpload = uploadFile()({ storageKey: MulterEnum.diskStorage });

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
  diskUpload.single("profilePicture"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updateData: Partial<typeof req.body> = { ...req.body };

      if (req.file) {
        updateData.profilePicture = getPublicUploadPath(req.file);
      }

      const userData = await userService.updateUserProfile(
        req.user?.id as string,
        updateData
      );

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
  diskUpload.single("profileCoverPicture"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new BadRequestException("Cover picture file is required");
      }

      const userData = await userService.updateProfileCoverPicture(
        req.user?.id as string,
        getPublicUploadPath(req.file)
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
