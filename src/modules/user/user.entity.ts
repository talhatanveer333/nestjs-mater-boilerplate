import { RegisterPayload } from '../../modules/auth';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'admins',
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({
    nullable: true,
    name: `password`,
    length: 255,
  })
  password: string;

  @Column({
    type: "boolean",
    default: false,
  })
  twoFa: boolean;

  @Column({
    length: 255,
    nullable: true,
  })
  twoFaKey: string;

  @Column({ type: 'boolean', default: false })
  emailConfirmed: boolean;

  toJSON() {
    const { password, ...self } = this;
    return self;
  }

  toDto() {
    const { password, ...dto } = this;
    return dto;
  }

  fromDto(payload: RegisterPayload): User {
    this.email = payload.email;

    return this;
  }
}

export class UserFillableFields {
  email: string;
  password: string;
}
