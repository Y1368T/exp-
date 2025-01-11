import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ReqLoggerInterceptor } from "./common/interceptors/req.logger.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both localhost and 127.0.0.1 origins
  app.enableCors({
    origin: [
      "http://localhost:5500", // Frontend running on localhost
      "http://127.0.0.1:5500", // Frontend running on 127.0.0.1
    ],
    methods: "GET,POST,PUT,DELETE", // Allowed methods
    allowedHeaders: "Content-Type, Authorization", // Allowed headers
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix("api/v1");
  app.useLogger(console);


  // Global scoped interceptor
  app.useGlobalInterceptors(new ReqLoggerInterceptor());

  const config = new DocumentBuilder()
    .setTitle("TodoList Application REST APIs")
    .setDescription(
      "A full-featured Todo List/Task Management application built with NestJS, MYSQL, and Sequelize, implementing authentication, user management, todo lists, tasks, and reporting functionalities.",
    )
    .setVersion("1.0")
    .addTag("TodoList APIs")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(3000);
}
bootstrap();
