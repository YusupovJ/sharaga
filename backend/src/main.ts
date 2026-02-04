import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { envConfig } from "./common/config/env.config";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: "*",
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(envConfig.port);
}
bootstrap();
