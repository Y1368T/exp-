import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserEntity {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: "admin" | "user";

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
