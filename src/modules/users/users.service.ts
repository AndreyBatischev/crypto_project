import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './model/user.model';
import { AppError } from 'src/common/errors';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from '../cryptomus/model/payment.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
  ) {}

  public async createUser(
    createUserDto: CreateUserDto,
  ): Promise<CreateUserDto> {
    let { name, password, email, wallet } = createUserDto;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) throw new BadRequestException(AppError.USER_EXIST);

    const salt = await bcrypt.genSalt();
    password = await this.hashPassword(password, salt);

    await this.userRepository.create({
      name,
      email,
      password,
      wallet: 0,
    });

    return createUserDto;
  }

  public async updateWallet(amount: number, userId: number) {
    console.log(
      '🚀 ~ file: users.service.ts:42 ~ UsersService ~ updateWallet ~ userId:',
      userId,
    );
    console.log(
      '🚀 ~ file: users.service.ts:43 ~ UsersService ~ updateWallet ~ amount:',
      amount,
    );
    return this.userRepository.update(
      { wallet: amount },
      { where: { id: userId } },
    );
  }

  private async hashPassword(password: string, salt: string) {
    return bcrypt.hash(password, salt);
  }

  async findUserByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOne({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserById(id: number) {
    try {
      return this.userRepository.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async publicUser(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      attributes: { exclude: ['password'] },
    });
  }
}
