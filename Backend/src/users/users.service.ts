import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./users.model";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async remove(id: number): Promise<void> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException("User not found");
    return user.destroy();
  }
}
