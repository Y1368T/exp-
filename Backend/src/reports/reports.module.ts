import { Module } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "../auth/auth.module";
import { Task } from "../tasks/tasks.model";
import { TodolistModule } from "../todolist/todolist.module";

@Module({
  imports: [SequelizeModule.forFeature([Task]), AuthModule, TodolistModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
