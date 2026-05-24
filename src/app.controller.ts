import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "./modules/auth";
import { errorMiddleware } from "./middleware/error.middleware";
import {env} from "./config/env.service";
import DBconnection from "./database/connection";
import { redisService } from "./common/services/redis.service";
import { userRouter } from "./modules/user";


export const bootstrap = () => {
    const app : Express = express();

    
    app.use(express.json());
    DBconnection();

    app.get('/uploads/*path' , (req: Request, res: Response) => {
        return res.sendFile(req.params.path as string, { root: env.UPLOADS_DIR }, (err) => {
            if (err) {
                res.status(404).json({ message: "File not found" });
            }
        });
    });
    redisService.connect();
    app.use("/auth", authRouter)
    app.use("/user", userRouter)
  app.use(errorMiddleware);
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}