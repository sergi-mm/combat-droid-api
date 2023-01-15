import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

/**
 * End to End tests, check `app.controller.spec.ts` for more specific unit tests
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });

  it('should return same single target"', () => {
    const payload: any = {"protocols":["avoid-mech"],
        "scan":[
          {"coordinates":{"x":0,"y":22},"enemies":{"type":"soldier","number":10}}
        ]};
    return request(app.getHttpServer())
        .post('/radar')
        .send(payload)
        .expect(200)
        .expect({x: 0, y: 22});
  });

  it('should return not found 404"', () => {
    const payload: any = {"protocols":["prioritize-mech"],
        "scan":[
          {"coordinates":{"x":0,"y":22},"enemies":{"type":"soldier","number":10}}
        ]};
    return request(app.getHttpServer())
        .post('/radar')
        .send(payload)
        .expect(404);
  });

  it('should bad request 400 when incompatible protocols"', () => {
    const payload: any = {"protocols":["avoid-mech", "prioritize-mech"],
        "scan":[
          {"coordinates":{"x":0,"y":22},"enemies":{"type":"soldier","number":10}}
        ]};
    return request(app.getHttpServer())
        .post('/radar')
        .send(payload)
        .expect(400);
  });
});
