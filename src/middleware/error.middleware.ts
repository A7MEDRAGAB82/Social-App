import { Request, Response } from "express";

export const globalErrorHandler = (err : any, req : Request, res : Response , next:any) => {
    console.error(err);
    return res.status(500).json({ message : err.message || "Internal Server Error" });
}