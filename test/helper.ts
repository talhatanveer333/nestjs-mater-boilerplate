import { INestApplication } from '@nestjs/common';
import { getConnection } from 'typeorm';
import * as request from 'supertest';
import { User } from '../src/modules/user';

export class Helper {
  private app: INestApplication;
  private token: string;

  constructor(app: INestApplication) {
    this.app = app;
  }

  /**
   * Initialize testsuite
   * @returns accessToken
   */
  public async init() {
    const email = `test_fingerate_admin@yopmail.com`;
    const repository = getConnection().getRepository(User);
    const exists = await repository.findOne({ email });
    if (!exists) {
      await this.register();
    }
    return this.token;
  }

  /**
   * send email to the address and gets the token back
   * @Params
   * email
   */

  public async sendEmail(email) {
    await request(this.app.getHttpServer())
      .post('/api/auth/send_email')
      .send(email)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data.accessToken).toBeDefined();
        this.token = body.data.accessToken;
        console.log(this.token)
      })
  }
  /**
   * Register a test user
   * @returns
   */
  public async register() {
    const testUserDto = {
      userName: 'john58',
      fullName: 'john smith',
      email: 'test_fingerate_admin@yopmail.com',
      country: 'United States',
      phoneNumber: '+14842918831',
      password: 'Test@1234',
      passwordConfirmation: 'Test@1234',
    };

    await request(this.app.getHttpServer())
      .post('/api/auth/register')
      .send(testUserDto)
      .expect(201);
    return;
  }

  /**
   * Get Jwt Token of User
   * @returns JwtToken
   */
  public getAccessToken() {
    return `Bearer ${this.token}`;
  }

  /**
   * Login a test user
   * @returns
   */
  public async login(mail: string, pass: string) {
    const testUserDto = {
      email: mail,
      password: pass,
    };
    await request(this.app.getHttpServer())
      .post('/api/auth/login')
      .send(testUserDto)
      .expect(201)
      .expect(({ body }) => {
        expect(body.accessToken).toBeDefined();
        this.token = body.accessToken;
      });
  }

  /**
   * clear `test` database
   */
  public async clearDB() {
    const entities = getConnection().entityMetadatas;
    for (const entity of entities) {
      const repository = getConnection().getRepository(entity.name);
      await repository.query(
        `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
      );
    }
  }
}
