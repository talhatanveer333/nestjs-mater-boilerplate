import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import { AppModule } from '../../src/modules/main/app.module';

describe('Figrate auth test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    helper = new Helper(app);
    server = app.getHttpServer();
  });

  it(`Test /sample API`, async () => {
    expect(server).toBeDefined();
  });
});
