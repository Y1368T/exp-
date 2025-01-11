import { Controller, Get, UseGuards, UseInterceptors } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { GetUser } from "../auth/get-user.decorator";
import { ITasksCount } from "./reports.interfaces";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiForbiddenResponse,
  ApiProperty,
} from "@nestjs/swagger";
import { CacheInterceptor } from "@nestjs/cache-manager";
import { User } from "src/users/users.model";

class TasksCount {
  @ApiProperty({ description: "Total tasks" })
  totalTasks: number;
  @ApiProperty({ description: "Completed tasks" })
  completedTasks: number;
  @ApiProperty({ description: "Remaining tasks" })
  remainingTasks: number;
}

@ApiTags("Reports")
@ApiBearerAuth()
@Controller("reports")
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard())
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("/task-counts")
  @ApiOperation({ summary: "Get total number of tasks for a user" })
  @ApiResponse({
    status: 200,
    description: "Returns the total task count",
    type: TasksCount,
  })
  @ApiForbiddenResponse({ description: "Please add a Todo list first" })
  async getTaskCount(@GetUser() user: User): Promise<ITasksCount> {
    return this.reportsService.getTaskCount(user);
  }

  @Get("/avg-completed-per-day")
  @ApiOperation({ summary: "Get average tasks completed per day by a user" })
  @ApiResponse({
    status: 200,
    description: "Returns the average tasks completed per day",
    type: Number,
  })
  @ApiForbiddenResponse({ description: "Please add a Todo list first" })
  getAvgTasksPerDay(@GetUser() user: User): Promise<number> {
    return this.reportsService.getAvgTasksPerDay(user);
  }

  @Get("/not-completed-on-time")
  @ApiOperation({ summary: "Get tasks not completed on time by a user" })
  @ApiResponse({
    status: 200,
    description: "Returns the number of tasks not completed on time",
    type: Number,
  })
  @ApiForbiddenResponse({ description: "Please add a Todo list first" })
  getTasksNotCompletedOnTime(@GetUser() user: User): Promise<number> {
    return this.reportsService.getTasksNotCompletedOnTime(user);
  }

  @Get("/get-date-with-most-completed-tasks")
  @ApiOperation({ summary: "Get date with most tasks completed by a user" })
  @ApiResponse({
    status: 200,
    description:
      "Returns the date with most completed tasks or null if there are none",
    type: Date,
  })
  @ApiForbiddenResponse({ description: "Please add a Todo list first" })
  getDateWithMostCompletedTasks(@GetUser() user: User): Promise<Date | null> {
    return this.reportsService.getDateWithMostCompletedTasks(user);
  }
}
