import {Router} from 'express';
import type {Request, Response, NextFunction} from 'express';
import {userService} from './user.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { successResponse } from '../../common/success/success.response';
import { uploadFile } from '../../common/utils/multer/cloud';
import { MulterEnum } from '../../common/enums/multer.enum';



const router: Router = Router();

router.get(
    "/profile",authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userData = await userService.getUserProfile(req.user?.id as string);

        successResponse({
            res,
            message: "User profile retrieved successfully",
            statusCode: 200,
            data: userData
        });
    }

    
);

router.patch(
    "/profile",authMiddleware,uploadFile()({storageKey: MulterEnum.diskStorage}).single("profilePicture"),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const updateData = req.body;
        const userData = await userService.updateUserProfile(req.user?.id as string, updateData);

        successResponse({
            res,
            message: "User profile updated successfully",
            statusCode: 200,
            data: userData
        });
    }
);

export default router;