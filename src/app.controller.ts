import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "./modules/auth";
import { errorMiddleware } from "./middleware/error.middleware";
import {env} from "./config/env.service";


export const bootstrap = () => {
    const app : Express = express();

    app.use(express.json());
    app.use("/auth", authRouter)
  app.use(errorMiddleware);
    app.listen(env.port, () => {
        console.log(`Server is running on port ${env.port}`);
    });
}