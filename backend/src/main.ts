import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { loadRuntimeConfig } from './config/runtime-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Después de crear la app, para que ConfigModule ya haya cargado el .env en local.
  const { port, corsOrigins } = loadRuntimeConfig(process.env);
  configureApp(app, corsOrigins);

  await app.listen(port);
}
bootstrap();
