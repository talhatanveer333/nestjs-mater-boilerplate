import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/modules/main/app.module';
import { ValidationPipe } from '@nestjs/common';
import { Helper } from '../helper';
import * as request from 'supertest';
import { LoggerService } from '../../src/utils/logger/logger.service';
import { MailService } from '../../src/utils/mailer/mail.service';
import { MailerMock, LoggerMock } from '../mocks/mocks';
import { ResponseMessage } from '../../src/utils/enum';

describe('Fingerate auth test', () => {
  let app: INestApplication;
  let helper: Helper;
  let server: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(MailerMock)
      .overrideProvider(LoggerService)
      .useValue(LoggerMock)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    helper = new Helper(app);
    server = app.getHttpServer();
  });

  it(`Test /auth/send_email API`, async () => {
    await helper.sendEmail({ email: 'talhatanveer333@gmail.com' });
  });

  it(`Test /auth/set_password`, async () => {
    await request(server)
      .patch('/api/auth/set_password')
      .set('Authorization', helper.getAccessToken())
      .send({
        email: "talhatanveer333@gmail.com",
        password: "Testing193!",
        passwordConfirmation: "Testing193!"
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toEqual(ResponseMessage.SUCCESS)
      })
  });

  afterAll(async () => {
    await helper.clearDB();
    await app.close();
  });
});
