import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/strategy';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('secret_jwt'),
        signOptions: { expiresIn: configService.get<string>('expire_jwt') },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TokenService, JwtStrategy],
  exports: [TokenService],
})
export class TokenModule {}
