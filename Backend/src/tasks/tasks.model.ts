import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  BeforeUpdate,
  BeforeCreate,
} from "sequelize-typescript";
import { TodoList } from "../todolist/todolist.model";

@Table({ tableName: "tasks" })
export class Task extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column(DataType.TEXT)
  description: string;

  // Use JSON to store an array of strings
  @Column({ type: DataType.JSON, defaultValue: [] })
  fileAttachments: string[];

  @Column(DataType.DATE)
  dueDateTime: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  completionStatus: boolean;

  @Column(DataType.DATE)
  completionDateTime: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt: Date;

  @ForeignKey(() => TodoList)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  todoListId: number;

  @BelongsTo(() => TodoList)
  todoList: TodoList;

  @BeforeUpdate
  @BeforeCreate
  static addTimestampts(instance: Task) {
    instance.createdAt = instance.updatedAt = new Date();
  }
}
