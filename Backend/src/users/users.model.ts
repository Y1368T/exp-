import {
  Column,
  Model,
  Table,
  DataType,
  BeforeUpdate,
  BeforeCreate,
  HasOne,
  DeletedAt,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { TodoList } from "../todolist/todolist.model";

@Table({ tableName: "users" })
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,
    },
    set(value: string) {
      this.setDataValue("email", value.toLowerCase());
    },
  })
  email: string;

  @Column({
    type: DataType.ENUM("admin", "user"),
    defaultValue: "user",
    validate: {
      customValidator(value: string) {
        if (value === "admin") {
          throw new Error(
            "Cannot add another admin. There can only be one admin in the system.",
          );
        }
      },
    },
  })
  role: "admin" | "user";

  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  githubId: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  isVerified: boolean;

  @Column(DataType.STRING)
  passwordResetToken: string;

  @DeletedAt
  deletedAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasOne(() => TodoList)
  todoList: TodoList;

  @BeforeUpdate
  @BeforeCreate
  static addTimestampts(instance: User) {
    instance.createdAt = instance.updatedAt = new Date();
  }
}
