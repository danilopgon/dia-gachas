import { INestApplication } from '@nestjs/common';

/** Configuración HTTP común a `main.ts` y a los tests e2e. */
export function configureApp(
  app: INestApplication,
  corsOrigins: (string | RegExp)[],
): void {
  // El middleware de CORS va antes que cualquier controlador: también cubre las respuestas de error.
  app.enableCors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  // Railway envía SIGTERM al redesplegar: cierre ordenado.
  app.enableShutdownHooks();
}
