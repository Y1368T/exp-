import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  CreateTaskDto,
  UpdateTaskDto,
  UpdateTaskDueDateDto,
} from "./dto/create-task.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Task } from "./tasks.model";
import { TodolistService } from "../todolist/todolist.service";
import * as moment from "moment";
import { Op } from "sequelize";
import { TodoList } from "../todolist/todolist.model";
import { CacheService } from "src/common/cache/cache.service";
import { User } from "src/users/users.model";

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
    private todolistsService: TodolistService,
    private readonly cacheService: CacheService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    const tasksCount = await this.taskModel.count({
      where: { todoListId: todolist.id },
    });
    if (tasksCount > 50)
      throw new ForbiddenException(
        "Maximum task limit reached. You are only allowed to create a maximum of 50 tasks.",
      );
    const task = await this.taskModel.create({
      ...createTaskDto,
      userId: user.id,
      todoListId: todolist.id,
    });
    await this.resetTasksCache(user);
    return task;
  }

  async findAll(user: User): Promise<Task[]> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    if (!todolist) return [];

    const cachedTasks = await this.cacheService.get(`tasks:${user.id}`);
    if (cachedTasks) {
      return JSON.parse(cachedTasks as string);
    } else {
      const fetchedTasks = await this.taskModel.findAll({
        where: { todoListId: todolist.id },
        raw: true,
        order: [["updatedAt", "DESC"]],
      });
      await this.cacheService.set(
        `tasks:${user.id}`,
        JSON.stringify(fetchedTasks),
        0,
      );
      return fetchedTasks;
    }
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    let task = await this.taskModel.findOne({
      where: { id, todoListId: todolist.id },
    });
    if (!task) throw new NotFoundException();
    task = await task.update({ ...updateTaskDto });
    await this.resetTasksCache(user);
    return task;
  }

  async remove(id: number, user: User): Promise<void> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    const task = await this.taskModel.findOne({
      where: { id, todoListId: todolist.id },
    });
    if (!task) throw new NotFoundException();
    await task.destroy();
    return this.resetTasksCache(user);
  }

  async complete(id: number, user: User): Promise<Task> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    let task = await this.taskModel.findOne({
      where: { id, todoListId: todolist.id },
    });
    if (!task) throw new NotFoundException();
    if (task.completionStatus === true) return task;
    task = await task.update({
      completionStatus: true,
      completionDateTime: new Date(),
    });
    await this.resetTasksCache(user);
    return task;
  }

  async updateTaskDueDate(
    id: number,
    updateTaskDueDateDto: UpdateTaskDueDateDto,
    user: User,
  ): Promise<Task> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    const task = await this.taskModel.findOne({
      where: { id, todoListId: todolist.id },
    });
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    if (task.completionStatus === true) {
      throw new BadRequestException("Task is completed");
    }
    const dueDateTime = new Date(updateTaskDueDateDto.dueDateTime);

    if (dueDateTime <= new Date()) {
      throw new BadRequestException("Due date must be in the future");
    }
    return task.update({ dueDateTime });
  }

  async getUpcomingTasks(user: User): Promise<Task[]> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);
    const today = new Date();
    const upcomingTasks = await this.taskModel.findAll({
      where: {
        todoListId: todolist.id,
        dueDateTime: {
          [Op.gt]: today,
        },
      },
    });

    return upcomingTasks;
  }

  async similar(user: User): Promise<Task[]> {
    const todolist = await this.todolistsService.getTodoListForUser(user.id);

    const cachedTasks = await this.cacheService.get(`similar:tasks:${user.id}`);
    if (cachedTasks) {
      return JSON.parse(cachedTasks as string);
    }

    /*Return user a list of similar tasks. Two tasks A and B are considered similar if all the words in the task A exist in task B or vice versa.*/
    const tasks = await this.taskModel.findAll({
      where: { todoListId: todolist.id },
    });
    const similarTasks: Task[] = [];

    // Iterate through each task
    for (let i = 0; i < tasks.length; i++) {
      const taskWords = tasks[i].title.toLowerCase().split(" ");
      let isSimilar = false;

      // Compare task words with other tasks
      for (let j = 0; j < tasks.length; j++) {
        if (i !== j) {
          // Exclude the same task
          const otherTaskWords = tasks[j].title.toLowerCase().split(" ");

          // Check if all words in task A exist in task B or vice versa
          isSimilar =
            taskWords.every((word) => otherTaskWords.includes(word)) ||
            otherTaskWords.every((word) => taskWords.includes(word));

          if (isSimilar) break; // Found a similar task, no need to check further
        }
      }

      if (isSimilar) similarTasks.push(tasks[i]); // Add the similar task to the list
    }
    await this.cacheService.set(
      `similar:tasks:${user.id}`,
      JSON.stringify(similarTasks),
      0,
    );
    return similarTasks;
  }

  async getTasksDueToday(): Promise<Task[]> {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    return this.taskModel.findAll({
      where: {
        dueDateTime: {
          [Op.between]: [todayStart, todayEnd],
        },
      },
      include: {
        model: TodoList,
        attributes: ["id"],
        include: [
          {
            model: User,
            attributes: ["email"],
          },
        ],
      },
    });
  }

  private resetTasksCache(user: User): Promise<void> {
    this.cacheService.delete(`tasks:${user.id}`);
    this.cacheService.delete(`similar:tasks:${user.id}`);
    return Promise.resolve();
  }
}
