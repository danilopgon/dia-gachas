import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  // Comprobación de vida para la plataforma: no depende de AEMET ni de nada externo.
  @Get()
  check() {
    return { status: 'ok' };
  }
}
