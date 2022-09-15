import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, LoginPayload, RegisterPayload } from './';
import { CurrentUser } from './../common/decorator/current-user.decorator';
import { User } from './../user';
import { LoggerService } from '../../utils/logger/logger.service';
import {
  LoggerMessages,
  ResponseCode,
  ResponseMessage,
} from '../../utils/enum';
import { Request, Response } from 'express';
import { EmailDto, ForgotPasswordDto } from './register.payload';
import { ConfirmationPayload } from './confirmation.payload';
import { ToggleTwoFactorPayload, TwoFactorPayload, ConfrimEmailPayload } from './commons/auth.dtos';

@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly loggerService: LoggerService,
  ) {
    this.loggerService.setContext('AuthController');
  }


  @Post('send_email')
  async sendEmail(@Body() payload: RegisterPayload, @Res() res: Response): Promise<Response> {
    this.loggerService.log(`POST auth/send_email ${LoggerMessages.API_CALLED}`);
    const token = await this.authService.sendEmail(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SET_PASSWORD_EMAIL,
      data: token
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('confirm_email')
  async confirmEmail(@Body() payload: ConfrimEmailPayload, @Res() res: Response): Promise<Response> {
    this.loggerService.log(`GET auth/confirm_email ${LoggerMessages.API_CALLED}`);
    await this.authService.confirmEmail(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.EMAIL_CONFIRMED,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('set_password')
  async setPassword(@Body() payload: ConfirmationPayload, @Res() res: Response): Promise<Response> {
    this.loggerService.log(`PATCH auth/set_password ${LoggerMessages.API_CALLED}`,);
    const TotpURI = await this.authService.setPassword(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: TotpURI
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify_2fa')
  async verify2FA(@Body() payload: TwoFactorPayload, @Res() res: Response): Promise<Response> {
    this.loggerService.log(`POST auth/verify_2fa ${LoggerMessages.API_CALLED}`);
    const data = await this.authService.verify2FA(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data,
    })
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('toggle_2fa')
  async toggle2FA(@Body() payload: ToggleTwoFactorPayload, @Res() res: Response): Promise<Response> {
    this.loggerService.log(`POST auth/toggle_2fa ${LoggerMessages.API_CALLED}`);
    const result = await this.authService.toggle2FA(payload);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
      data: result
    })
  }

  @Post('register')
  async createAdmin(
    @Body() payload: RegisterPayload,
    @Res() res: Response,
  ): Promise<Response> {
    const user = await this.authService.registerAdmin(payload);
    return res.status(ResponseCode.CREATED_SUCCESSFULLY).send({
      statusCode: ResponseCode.CREATED_SUCCESSFULLY,
      data: user.toDto(),
      message: ResponseMessage.CREATED_SUCCESSFULLY,
    });
  }

  @Post('login')
  async login(@Body() payload: LoginPayload): Promise<any> {
    this.loggerService.log(`POST auth/login ${LoggerMessages.API_CALLED}`);
    const user = await this.authService.validateUser(payload);
    return await this.authService.createToken(user);
  }

  @Post('forgot_password')
  async forgotPassword(
    @Body() body: EmailDto,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/forgot_password ${LoggerMessages.API_CALLED}`,
    );
    await this.authService.forgotPassword(body.email);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.FORGOT_PASSWORD_EMAIL,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('verify_token')
  async checkPasswordLinkExpiry(
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/verify_token ${LoggerMessages.API_CALLED}`,
    );
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.checkPasswordLinkExpiry(user.email, token);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('confirm_forgot_password')
  async forgotConfirmPassword(
    @CurrentUser() user: User,
    @Res() res: Response,
    @Body() payload: ForgotPasswordDto,
  ): Promise<Response> {
    this.loggerService.log(
      `GET auth/confirm_forgot_password ${LoggerMessages.API_CALLED}`,
    );
    await this.authService.confirmForgotPassword(user.email, payload.password);
    return res.status(ResponseCode.SUCCESS).send({
      statusCode: ResponseCode.SUCCESS,
      message: ResponseMessage.SUCCESS,
    });
  }

  @UseGuards(AuthGuard())
  @Get('me')
  async getLoggedInUser(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
