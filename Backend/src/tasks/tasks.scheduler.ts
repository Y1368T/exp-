import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { TasksService } from "./tasks.service";
import { MailService } from "../mail/mail.service";

@Injectable()
export class TasksScheduler {
  constructor(
    private readonly tasksService: TasksService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: "UTC" })
  async handleCron() {
    const tasksDueToday = await this.tasksService.getTasksDueToday();

    for (const task of tasksDueToday) {
      const user = task.todoList.user;
      this.mailService.sendTaskReminder(user.email, task);
    }
  }
}
