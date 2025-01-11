import { Test, TestingModule } from "@nestjs/testing";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/create-task.dto";
import { Task } from "./tasks.model";
import { BadRequestException } from "@nestjs/common";
import { User } from "src/users/users.model";
import { TodoList } from "src/todolist/todolist.model";

describe("TasksController", () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  const userMock: User = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user", // Assuming the user is a regular user, not admin
    password: "password123",
    githubId: "github123",
    isVerified: true,
    passwordResetToken: "resetToken123",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null, // assuming no soft deletion
    todoList: {
      id: 1,
      title: "My Todo List",
      description: "A sample todo list",
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 1,
    } as TodoList,
  } as User;

  const taskMock: Task = {
    title: "Task 1",
    description: "Task 1 description",
    fileAttachments: [],
    dueDateTime: new Date(),
    completionStatus: false,
    completionDateTime: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    todoListId: 1,
  } as Task;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: {
            create: jest.fn().mockResolvedValue(taskMock),
            findAll: jest.fn().mockResolvedValue([taskMock]),
            similar: jest.fn().mockResolvedValue([taskMock]),
            update: jest.fn().mockResolvedValue(taskMock),
            remove: jest.fn().mockResolvedValue(undefined),
            complete: jest.fn().mockResolvedValue(taskMock),
          },
        },
      ],
    }).compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const createTaskDto: CreateTaskDto = {
        title: "Task 19",
        description: "Task 1 description",
        dueDateTime: new Date().toString(),
      };

      const result = await tasksController.create(createTaskDto, userMock);

      expect(result).toEqual(taskMock);
      expect(tasksService.create).toHaveBeenCalledWith(createTaskDto, userMock);
    });

    it("should not create a task without title", async () => {
      const createTaskDto = {
        title: "",
        description: "Task 1 description",
      };

      await expect(
        tasksService.create(createTaskDto, userMock),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("findAll", () => {
    it("should retrieve all tasks of a user", async () => {
      const result = await tasksController.findAll(userMock);

      expect(result).toEqual([taskMock]);
      expect(tasksService.findAll).toHaveBeenCalledWith(userMock);
    });
  });

  describe("similar", () => {
    it("should retrieve similar tasks of a user", async () => {
      const result = await tasksController.similar(userMock);

      expect(result).toEqual([taskMock]);
      expect(tasksService.similar).toHaveBeenCalledWith(userMock);
    });
  });

  describe("update", () => {
    it("should update a task", async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: "Updated Task 1",
        description: "Updated Task 1 description",
      };

      const result = await tasksController.update(1, updateTaskDto, userMock);

      expect(result).toEqual(taskMock);
      expect(tasksService.update).toHaveBeenCalledWith(
        1,
        updateTaskDto,
        userMock,
      );
    });
  });

  describe("remove", () => {
    it("should delete a task", async () => {
      await tasksController.remove(1, userMock);

      expect(tasksService.remove).toHaveBeenCalledWith(1, userMock);
    });
  });

  describe("complete", () => {
    it("should mark a task as complete", async () => {
      const result = await tasksController.complete(1, userMock);

      expect(result).toEqual(taskMock);
      expect(tasksService.complete).toHaveBeenCalledWith(1, userMock);
    });
  });
});
