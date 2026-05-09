import express from "express";
import type { Express, Request, Response } from "express";



export const bootstrap = () => {
    const app : Express = express();
    const port : number = 3000;



    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}