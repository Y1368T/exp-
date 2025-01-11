import { Test, TestingModule } from "@nestjs/testing";
import { HttpStatus, INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "../src/auth/auth.module";
import { TodolistModule } from "../src/todolist/todolist.module";
import { TodoList } from "../src/todolist/todolist.model";
import { Task } from "../src/tasks/tasks.model";
import { CreateTodolistDto } from "../src/todolist/dto/create-todolist.dto";
import { User } from "src/users/users.model";

describe("TodolistController (e2e)", () => {
  let app: INestApplication;
  let user: User;
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibm9vcmF3YW40NDRAZ21haWwuY29tIiwiaWF0IjoxNjg3NzkzODQwLCJleHAiOjE2ODc4MTE4NDB9.37jd8S_F0PByiBk7hF6E4l9OBTs0qiSfNX5M6s1c3nc";
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TodolistModule,
        SequelizeModule.forRoot({
          dialect: "postgres",
          host: "localhost",
          port: 5432,
          username: "postgres",
          password: "12345",
          database: "test_db",
          autoLoadModels: true,
        }),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Create a user for testing
    user = await User.create({
      name: "John",
      email: "john@me.io",
      password: "12345",
    });
  });

  // afterAll(async () => {});

  beforeEach(async () => {
    // Clean up the database before each test
    await TodoList.destroy({ truncate: true, cascade: true });
    await Task.destroy({ truncate: true, cascade: true });
  });

  // The rest of your tests here...
  describe("/todolist (POST)", () => {
    it("should create a new todolist", async () => {
      const createTodolistDto: CreateTodolistDto = {
        title: "My Todo List",
        description: "My first todo list",
      };

      const response = await request(app.getHttpServer())
        .post("/todolist")
        .set("Authorization", `Bearer ${token}`) // assuming user.token holds the authentication token
        .send(createTodolistDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toHaveProperty("id");
      expect(response.body.title).toBe(createTodolistDto.title);
      expect(response.body.description).toBe(createTodolistDto.description);
      expect(response.body.userId).toBe(user.id);
      expect(response.body.createdAt).toBeDefined();
    });

    it("should return an error if a user already has a todolist", async () => {
      // Create a todolist with an existing user
      const existingTodoList = await TodoList.create({
        title: "Existing List",
        description: "An existing todolist",
        userId: user.id, // Set the user ID here
      });

      const createTodolistDto: CreateTodolistDto = {
        title: "New List",
        description: "A new todolist",
      };

      const response = await request(app.getHttpServer())
        .post("/todolist")
        .set("Authorization", `Bearer ${token}`) // assuming user.token holds the authentication token
        .send(createTodolistDto)
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.message).toBe(
        "You can't add more than one todo list",
      );

      // Verify that the existing todolist was not modified
      const updatedExistingTodoList = await TodoList.findByPk(
        existingTodoList.id,
      );
      expect(updatedExistingTodoList).toEqual(existingTodoList);
    });
  });

  describe("/todolist (GET)", () => {
    it("should retrieve the user's todolist", async () => {
      // Create a todolist with a user
      const userTodoList = await TodoList.create({
        title: "User's Todo List",
        description: "The user's todolist",
        userId: user.id, // Set the user ID here
      });

      const response = await request(app.getHttpServer())
        .get("/todolist")
        .set("Authorization", `Bearer ${token}`) // assuming user.token holds the authentication token
        .expect(HttpStatus.OK);

      expect(response.body).toHaveProperty("id", userTodoList.id);
      expect(response.body.title).toBe(userTodoList.title);
      expect(response.body.description).toBe(userTodoList.description);
      expect(response.body.userId).toBe(userTodoList.userId);
      expect(response.body.createdAt).toBeDefined();
    });

    it("should return an error if the user has no todolist", async () => {
      const response = await request(app.getHttpServer())
        .get("/todolist")
        .set("Authorization", `Bearer ${token}`) // assuming user.token holds the authentication token
        .expect(HttpStatus.FORBIDDEN);

      expect(response.body.message).toBe("Please add a Todo list first");
    });
  });
});
