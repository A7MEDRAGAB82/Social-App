import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "./modules/auth";
import { errorMiddleware } from "./middleware/error.middleware";
import {env} from "./config/env.service";
import DBconnection from "./database/connection";
import { redisService } from "./common/services/redis.service";


export const bootstrap = () => {
    const app : Express = express();

    
    app.use(express.json());
    DBconnection();
    redisService.connect();
    app.use("/auth", authRouter)
  app.use(errorMiddleware);
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}