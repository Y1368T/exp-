import { Controller, Post, Body, UseGuards, Get } from "@nestjs/common";
import { TodolistService } from "./todolist.service";
import { CreateTodolistDto } from "./dto/create-todolist.dto";
import { AuthGuard } from "@nestjs/passport";
import { GetUser } from "../auth/get-user.decorator";
import { TodoList } from "./todolist.model";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from "@nestjs/swagger";
import { User } from "src/users/users.model";

@ApiTags("Todolist")
@Controller("todolist")
@UseGuards(AuthGuard())
export class TodolistController {
  constructor(private readonly todolistService: TodolistService) {}

  @Post()
  @ApiOperation({ summary: "Create a new todo list" })
  @ApiBody({ type: CreateTodolistDto, description: "Todo list data" })
  @ApiCreatedResponse({
    type: TodoList,
    description: "The created todo list",
  })
  @ApiForbiddenResponse({ description: "Please add a Todo list first" })
  create(
    @Body() createTodolistDto: CreateTodolistDto,
    @GetUser() user: User,
  ): Promise<TodoList> {
    return this.todolistService.create(createTodolistDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get a todo list" })
  @ApiResponse({
    status: 200,
    type: TodoList,
    description: "The retrieved todo list",
  })
  get(@GetUser() user: User): Promise<TodoList> {
    return this.todolistService.findOne(user);
  }
}
