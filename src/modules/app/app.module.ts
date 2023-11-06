import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configurations from '../../configurations';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from '../users/model/user.model';
import {
  FailedPayment,
  Payment,
  SuccessPayment,
} from '../payment/model/payment.model';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configurations],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('db_host'),
        port: configService.get('db_port'),
        username: configService.get('db_user'),
        password: configService.get('db_password'),
        database: configService.get('db_database'),
        synchronize: true,
        autoLoadModels: true,
        models: [User, Payment, SuccessPayment, FailedPayment],
      }),
    }),
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
