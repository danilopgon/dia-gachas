import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const rawOrigins = configService.get<string>('CORS_ORIGIN');

  if (!rawOrigins) {
    throw new Error('❌ CORS_ORIGIN no está definido en el .env');
  }

  const corsOrigins = rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (corsOrigins.length === 0) {
    throw new Error('❌ CORS_ORIGIN está vacío');
  }

  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  await app.listen(4000);
}
bootstrap();
