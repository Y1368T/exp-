import { Module } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TasksController } from "./tasks.controller";
import { AuthModule } from "../auth/auth.module";
import { Task } from "./tasks.model";
import { SequelizeModule } from "@nestjs/sequelize";
import { MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { TodolistModule } from "../todolist/todolist.module";
import { MailService } from "../mail/mail.service";
import { TasksScheduler } from "./tasks.scheduler";
import { CacheService } from "src/common/cache/cache.service";

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: "upload/tasks",
        filename: (_, file, callback) => {
          const uniqueName = Math.random().toString(16);
          const extension = extname(file.originalname);
          callback(null, `${uniqueName}${extension}`);
        },
      }),
    }),
    SequelizeModule.forFeature([Task]),
    AuthModule,
    TodolistModule,
  ],
  controllers: [TasksController],
  providers: [TasksService, MailService, TasksScheduler, CacheService],
})
export class TasksModule {}
