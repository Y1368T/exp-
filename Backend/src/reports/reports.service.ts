import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { Op, Sequelize } from "sequelize";
import { InjectModel } from "@nestjs/sequelize";
import { Task } from "../tasks/tasks.model";
import { ITasksCount } from "./reports.interfaces";
import { TodolistService } from "../todolist/todolist.service";
import { User } from "src/users/users.model";

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
    private todoListService: TodolistService,
  ) {}

  async getTaskCount(user: User): Promise<ITasksCount> {
    const todolist = await this.todoListService.getTodoListForUser(user.id);
    const totalTasks = await this.taskModel.findAndCountAll({
      where: { todoListId: todolist.id },
    });
    const completedTasks = totalTasks.rows.filter(
      (task) => task.completionStatus,
    ).length;
    const remainingTasks = totalTasks.count - completedTasks;

    return {
      totalTasks: totalTasks.count,
      completedTasks: completedTasks,
      remainingTasks: remainingTasks,
    };
  }

  async getAvgTasksPerDay(user: User): Promise<number> {
    const todolist = await this.todoListService.getTodoListForUser(user.id);
    const daysSinceAccountCreation = moment().diff(user.createdAt, "days");
    if (daysSinceAccountCreation === 0) {
      // If no days have passed since the account creation
      return 0;
    }
    const completedTasks = await this.taskModel.count({
      where: { todoListId: todolist.id, completionStatus: true },
    });
    return Math.floor(completedTasks / daysSinceAccountCreation);
  }

  async getTasksNotCompletedOnTime(user: User): Promise<number> {
    const todolist = await this.todoListService.getTodoListForUser(user.id);
    return await this.taskModel.count({
      where: {
        todoListId: todolist.id,
        completionStatus: true,
        completionDateTime: { [Op.gt]: Sequelize.col("dueDateTime") },
      },
    });
  }

  async getDateWithMostCompletedTasks(user: User): Promise<Date | null> {
    const todolist = await this.todoListService.getTodoListForUser(user.id);
    const tasks = await this.taskModel.findAll({
      where: { todoListId: todolist.id, completionStatus: true },
      attributes: ["completionDateTime"],
    });

    // group tasks by completion date
    const tasksByDate = tasks.reduce((grouped, task) => {
      const date = moment(task.completionDateTime).format("YYYY-MM-DD"); // get only the date part
      grouped[date] = (grouped[date] || 0) + 1;
      return grouped;
    }, {});

    // find the date with maximum tasks
    let maxDate = null;
    let maxCount = 0;

    for (const key in tasksByDate) {
      if ((tasksByDate[key] as number) > maxCount) {
        maxCount = tasksByDate[key] as number;
        maxDate = key;
      }
    }

    return maxDate;
  }
}
