import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { TokenService } from '../token/token.service';
import { CreateUserDto, LoginUserDto } from '../users/dto/create-user.dto';
import { AppError } from 'src/common/errors';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly tokenService: TokenService,
  ) {}

  public async registerUser(createUserDto: CreateUserDto) {
    const newUser = await this.userService.createUser(createUserDto);
    const payload = {
      email: createUserDto.email,
    };

    delete newUser.password;
    const token = await this.tokenService.generateJwtToken(payload);
    return { ...newUser, token };
  }

  public async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userService.findUserByEmail(loginUserDto.email);

    if (!user) throw new BadRequestException(AppError.USER_NOT_EXIST);

    const checkPassword = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!checkPassword) throw new BadRequestException(AppError.WRONG_DATA);

    const payload = {
      email: loginUserDto.email,
      id: user.id,
    };

    // const userPublic = await this.userService.publicUser(user.email);
    const token = await this.tokenService.generateJwtToken(payload);
    delete user.dataValues.password;
    return { ...user.dataValues, token };
  }
}
