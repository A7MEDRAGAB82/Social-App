import express from "express";
import type { Express, Request, Response } from "express";
import { authRouter } from "./modules/auth";



export const bootstrap = () => {
    const app : Express = express();
    const port : number = 3000;

    app.use(express.json());
    app.use("/auth", authRouter)

    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}