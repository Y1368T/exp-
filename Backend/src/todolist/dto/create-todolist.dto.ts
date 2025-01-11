import { IsString, IsOptional, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTodolistDto {
  @ApiProperty({ description: "The title of the todolist" })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "The description of the todolist",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
