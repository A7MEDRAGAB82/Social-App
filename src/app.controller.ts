import express from "express";
import type { Express, Request, Response } from "express";
import path from "path";
import { authRouter } from "./modules/auth";
import { errorMiddleware } from "./middleware/error.middleware";
import {env} from "./config/env.service";
import DBconnection from "./database/connection";
import { redisService } from "./common/services/redis.service";
import { userRouter } from "./modules/user";


export const bootstrap = () => {
    const app : Express = express();

    
    app.use(express.json());
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
    DBconnection();
    redisService.connect();
    app.use("/auth", authRouter)
    app.use("/user", userRouter)
  app.use(errorMiddleware);
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}