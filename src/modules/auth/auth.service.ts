import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { MailService } from '../../utils/mailer/mail.service';
import { RegisterPayload } from '.';
import { Hash } from '../../utils/Hash';
import { User, UsersService } from './../user';
import { LoginPayload } from './login.payload';
import { ConfirmationPayload } from './confirmation.payload';
import { generateKey, generateTotpUri, verifyToken } from "authenticator";
import { ToggleTwoFactorPayload, TwoFactorPayload, ConfrimEmailPayload } from './commons/auth.dtos';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
    private readonly mailerservice: MailService,
  ) { }

  /**
   * It saves the admin(if not exists already) without the password 
   * @param payload
   * @returns the access token using "email" and "uuid"
   */
  async sendEmail(payload: RegisterPayload) {
    let user: User = await this.userService.getByEmail(payload.email);
    if (!user) user = await this.userService.createAdmin(payload);
    const { accessToken } = await this.createToken(user);
    await this.mailerservice.sendEmailConfirmation(user, accessToken);
    return { accessToken };
  }

  /**
   * Confirm User Email
   * @param user
   * @returns
   */
  public async confirmEmail(payload: ConfrimEmailPayload): Promise<User> {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) throw new HttpException(ResponseMessage.INVALID_EMAIL, ResponseCode.BAD_REQUEST);
    if (user.emailConfirmed)
      throw new HttpException(
        ResponseMessage.EMAIL_LINK_EXPIRED,
        ResponseCode.BAD_REQUEST,
      );
    return await this.userService.updateEmailStatus(user);
  }

  /**
   * it saves/changes the password of existing user
   * @param payload
   * @returns the twoFA key
   */
  async setPassword(payload: ConfirmationPayload): Promise<any> {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) throw new HttpException(ResponseMessage.INVALID_EMAIL, ResponseCode.BAD_REQUEST);
    await this.userService.setPassword(user, payload.password);
    return await this.generateToTpURI(user);
  }

  /**
   * 
   * @param payload 
   * @returns the access token
   */
  async verify2FA(payload: TwoFactorPayload): Promise<any> {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) throw new HttpException(ResponseMessage.INVALID_EMAIL, ResponseCode.BAD_REQUEST);
    if (!user.twoFa) throw new HttpException(ResponseMessage.TWOFACTOR_DISABLED, ResponseCode.BAD_REQUEST);

    const verified = await verifyToken(user.twoFaKey, payload.code);
    if (!verified) throw new HttpException(ResponseMessage.INVALID_2FA_CODE, ResponseCode.BAD_REQUEST);

    const { accessToken } = await this.createToken(user);
    return { accessToken };
  }


  async toggle2FA(payload: ToggleTwoFactorPayload) {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) throw new HttpException(ResponseMessage.INVALID_EMAIL, ResponseCode.BAD_REQUEST);

    const verified = await verifyToken(user.twoFaKey, payload.code);
    if (!verified) throw new HttpException(ResponseMessage.INVALID_2FA_CODE, ResponseCode.BAD_REQUEST);

    return await this.userService.toggle2FA(user);
  }

  async createToken(
    user: User,
    expiryTime?: number | string,
    subject?: string,
  ) {
    return {
      expiresIn: process.env.JWT_EXPIRATION_TIME,
      accessToken: this.jwtService.sign(
        { uuid: user.uuid, email: user.email },
        {
          subject: subject ? process.env.JWT_SECRET_KEY + user.password : '',
          expiresIn: expiryTime ? expiryTime : process.env.JWT_EXPIRATION_TIME,
        },
      ),
      user,
    };
  }

  /**
   * Register a genesis user
   * @param payload
   * @returns
   */
  public async registerAdmin(payload: RegisterPayload): Promise<User> {
    return new Promise<User>(async (resolve, reject) => {
      await this.userService
        .createAdmin(payload)
        .then(async (user: User) => {
          await this.createToken(user);
          return resolve(user);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async validateUser(payload: LoginPayload): Promise<any> {
    const user = await this.userService.getByEmail(payload.email);
    if (!user) {
      throw new HttpException(
        ResponseMessage.INVALID_USERNAME_OR_PASSWORD,
        ResponseCode.BAD_REQUEST,
      );
    }
    const isValidPassword = await Hash.compare(payload.password, user.password);
    if (!isValidPassword) {
      throw new HttpException(
        ResponseMessage.INVALID_USERNAME_OR_PASSWORD,
        ResponseCode.BAD_REQUEST,
      );
    }
    return user;
  }

  /**
   * Send Password Recovery Link To User Email
   * @param email
   * @returns
   */
  public async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.getByEmail(email);
    if (user) {
      const token = await this.createToken(
        user,
        process.env.JWT_TIME_FORGOT_PASSWORD,
        user.password,
      );
      await this.mailerservice.sendForgotPasswordMail(
        user.email,
        token.accessToken,
      );
      return;
    } else {
      throw new HttpException(
        ResponseMessage.EMAIL_NOT_REGISTERED,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  async checkPasswordLinkExpiry(email: string, token: string) {
    try {
      const user = await this.userService.getByEmail(email);
      const subject = process.env.JWT_SECRET_KEY + user.password;
      this.jwtService.verify(token, { subject });
      return;
    } catch (err) {
      throw new HttpException(
        ResponseMessage.RESET_PASSWORD_LINK_EXPIRED,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  /**
   * Confirm the forgot password and update
   * @param email
   * @param password
   * @returns
   */
  public async confirmForgotPassword(email: string, password: string) {
    await this.userService.confirmForgotPassword(email, password);
    return;
  }
  /**
   * 
   * @param user 
   * @returns ToTpURI key and corresponding URI
   */
  public async generateToTpURI(user: User) {
    let key = user.twoFaKey ? user.twoFaKey : generateKey();
    let formattedKey = key.replace(/\s/g, "").toUpperCase();
    user.twoFaKey ? null : await this.userService.setToTpURI(user, formattedKey);

    const toTpURI = generateTotpUri(
      formattedKey,
      user.email,
      process.env.APP_NAME,
      "SHA1",
      6,
      30
    );
    return { toTpURI, formattedKey };
  }
}
