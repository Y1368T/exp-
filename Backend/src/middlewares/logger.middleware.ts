import { Injectable, NestMiddleware } from "@nestjs/common";
import * as morgan from "morgan";
import * as fs from "fs";
import * as path from "path";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const accessLogStream = fs.createWriteStream(
      path.join(__dirname, "../../logs/access.log"),
      { flags: "a" },
    );
    const morganLogger = morgan("combined", { stream: accessLogStream });
    morganLogger(req, res, (err) => {
      if (err) console.error(err);
      next();
    });
  }
}
