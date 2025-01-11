import {
  IsDateString,
  IsBoolean,
  IsString,
  IsOptional,
  IsNotEmpty,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({ description: "Title of the task" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Description of the task" })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "File attachments for the task" })
  fileAttachments?: string[];

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Due date and time for the task" })
  dueDateTime?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ description: "Completion status of the task" })
  completionStatus?: boolean;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Title of the task" })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "Description of the task" })
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: "File attachments for the task" })
  fileAttachments?: string[];
}

export class UpdateTaskDueDateDto {
  @ApiProperty({ description: "New due date and time for the task" })
  @IsNotEmpty()
  @IsDateString()
  dueDateTime: string;
}
