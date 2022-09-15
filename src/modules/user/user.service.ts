import {
  HttpException,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hash } from '../../utils/Hash';
import { RegisterPayload } from 'modules/auth';
import { Repository } from 'typeorm';
import { ResponseCode, ResponseMessage } from '../../utils/enum';
import { User, UserFillableFields } from './user.entity';


@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async get(uuid: string) {
    return this.userRepository.findOne({ uuid });
  }

  async getByEmail(email: string) {
    return await this.userRepository.findOne({ email });
  }


  /**
   * hashes the password first and saves it
   * @param user 
   * @param newPassword 
   * @returns 
   */
  async setPassword(user: User, newPassword: string) {
    user.password = await Hash.make(newPassword);
    return await this.userRepository.save(user);
  }

  async setToTpURI(user: User, key: string) {
    user.twoFaKey = key;
    user.twoFa = true;
    return await this.userRepository.save(user);
  }

  /**
   * Create a genesis user
   * @param payload
   * @returns
   */
  async createAdmin(payload: RegisterPayload): Promise<User> {
    const user = await this.getByEmail(payload.email);
    if (user) {
      throw new HttpException(
        ResponseMessage.USER_ALREADY_EXISTS,
        ResponseCode.BAD_REQUEST,
      );
    }
    const newUser = new User().fromDto(payload);

    return await this.userRepository.save(newUser);
  }

  /**
   * Forget password confirmation
   * @param email
   * @param password
   * @returns
   */
  public async confirmForgotPassword(email: string, password: string) {
    const user: User = await this.userRepository.findOne({ email });
    if (user) {
      const passwordHash = await Hash.make(password);
      await this.userRepository.update({ email }, { password: passwordHash });
      return user;
    } else {
      throw new HttpException(
        ResponseMessage.USER_DOES_NOT_EXIST,
        ResponseCode.NOT_FOUND,
      );
    }
  }

  /**
   * Update user email status
   * @param user
   * @returns
   */
  async updateEmailStatus(user: User): Promise<User> {
    user.emailConfirmed = true;
    const confirmedUser = await this.userRepository.save(user);
    return confirmedUser;
  }

  /**
   * 
   * @param user 
   * @returns 
   */
  async toggle2FA(user: User) {
    user.twoFa = !user.twoFa;
    await this.userRepository.save(user);
    return user.twoFa ? `Enabled` : `Disabled`;
  }
}
