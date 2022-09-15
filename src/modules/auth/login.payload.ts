import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginPayload {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
