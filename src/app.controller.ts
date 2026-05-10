import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "./modules/auth";
import { globalErrorHandler } from "./middleware/error.middleware";



export const bootstrap = () => {
    const app : Express = express();
    const port : number = 3000;

    app.use(express.json());
    app.use("/auth", authRouter)
  app.use(globalErrorHandler);
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}