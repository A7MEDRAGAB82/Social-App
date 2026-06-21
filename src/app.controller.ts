import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { authRouter } from "./modules/auth";
import { errorMiddleware } from "./middleware/error.middleware";
import { env } from "./config/env.service";
import DBconnection from "./database/connection";
import { redisService } from "./common/services/redis.service";
import { userRouter } from "./modules/user";
import { postsRouter } from "./modules/posts";
import { s3Service } from "./common/services/s3.service";
import { BadRequestException } from "./common/exceptions/application.exception";
import { initializeGraphQL } from "./graphql";
import {Server} from "socket.io"
import { connections } from "mongoose";

const resolveUploadKey = (req: Request): string => {
  if (typeof req.query.key === "string" && req.query.key.trim()) {
    return req.query.key;
  }

  const pathParam = req.params.path;

  if (Array.isArray(pathParam)) {
    return pathParam.join("/");
  }

  if (typeof pathParam === "string" && pathParam.trim()) {
    return pathParam;
  }

  return "";
};

export const bootstrap = () => {
  const app: Express = express();

  app.use(express.json());
  DBconnection();

  app.get(
    "/uploads/*path",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const key = resolveUploadKey(req);

        if (!key) {
          throw new BadRequestException(
            "File key is required via path or ?key= query parameter"
          );
        }

        const s3Response = await s3Service.getAsset(key);

        res.setHeader(
          "Content-Type",
          s3Response.contentType ?? "application/octet-stream"
        );
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${key.split("/").pop()}"`
        );

        res.send(s3Response.buffer);
      } catch (error) {
        next(error);
      }
    }
  );

  redisService.connect();

  // Initialize GraphQL
  initializeGraphQL(app);

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/posts", postsRouter);
  

  app.use(errorMiddleware);

 const httpServer = app.listen(env.port, () => {
    console.log(`Server is running on port ${env.port}`);
  });


  const io = new Server(httpServer)

  io.on("connection", (socket) => {
    connections.push(socket.id)
    console.log(socket)
  });

 
  


};
