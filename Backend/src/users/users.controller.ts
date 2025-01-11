import {
  Controller,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Get,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "src/role/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { RolesGuard } from "src/common/guards/roles.guard";
import { User } from "./users.model";
import { plainToClass } from "class-transformer";
import { UserEntity } from "src/entites/serialized-user.entity";

@Controller("users")
@UseGuards(AuthGuard("jwt"))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersService.findAll();
    return users.map((user: User) => {
      const serializedUser = plainToClass(UserEntity, user);
      return serializedUser;
    });
  }

  @Delete(":id")
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.usersService.remove(id);
  }
}
