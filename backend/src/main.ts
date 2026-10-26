import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadRuntimeConfig } from './config/runtime-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Después de crear la app, para que ConfigModule ya haya cargado el .env en local.
  const { port, corsOrigins } = loadRuntimeConfig(process.env);

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  // Railway envía SIGTERM al redesplegar: cierre ordenado.
  app.enableShutdownHooks();

  await app.listen(port);
}
bootstrap();
