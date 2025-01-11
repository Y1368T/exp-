import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User } from "./users.model";
import { SequelizeModule } from "@nestjs/sequelize";
// import { JwtStrategy } from 'src/auth/jwt.strategy';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
