import {Router} from 'express';
import type {Request, Response, NextFunction} from 'express';
import {userService} from './user.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { successResponse } from '../../common/success/success.response';



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





export default router;