import { Module } from '@nestjs/common';
import { CryptomusController } from './cryptomus.controller';
import { CryptomusService } from './cryptomus.service';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  FailedPayment,
  FailedPayout,
  Payment,
  Payout,
  SuccessPayment,
  SuccessPayout,
} from './model/payment.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Payment,
      FailedPayment,
      SuccessPayment,
      Payout,
      SuccessPayout,
      FailedPayout,
    ]),
    UsersModule,
  ],
  controllers: [CryptomusController],
  providers: [CryptomusService],
})
export class CryptomusModule {}
