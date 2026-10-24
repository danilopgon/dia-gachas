import { HttpService } from '@nestjs/axios';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { throwError } from 'rxjs';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API sin base de datos (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    delete process.env.DATABASE_URL;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      // AEMET no responde en el test: así se comprueba el error sin salir a la red.
      .overrideProvider(HttpService)
      .useValue({ get: () => throwError(() => new Error('sin red')) })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('ya no expone /cities', async () => {
    await request(app.getHttpServer()).get('/cities?name=alb').expect(404);
  });

  it('GET /weather/:code responde 502 si AEMET falla, como hasta ahora', async () => {
    await request(app.getHttpServer()).get('/weather/xx').expect(502);
  });
});
