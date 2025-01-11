import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  HasMany,
  BelongsTo,
  BeforeCreate,
} from "sequelize-typescript";
import { Task } from "../tasks/tasks.model";
import { User } from "src/users/users.model";

@Table({ tableName: "todolists", updatedAt: false })
export class TodoList extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId: number;

  @HasMany(() => Task)
  tasks: Task[];

  @BelongsTo(() => User)
  user: User;

  @BeforeCreate
  static setDate(instance: TodoList) {
    instance.createdAt = new Date();
  }
}
