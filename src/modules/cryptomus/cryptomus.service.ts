import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/model/user.model';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import { instance } from 'src/helpers/axios';
import { InjectModel } from '@nestjs/sequelize';
import {
  FailedPayment,
  FailedPayout,
  Payment,
  Payout,
  SuccessPayment,
  SuccessPayout,
} from './model/payment.model';
import { PaymentStatus } from 'src/common/enums';
import { UsersService } from '../users/users.service';
import { Cron } from '@nestjs/schedule';
import { AppError } from 'src/common/errors';
import { createPaymentDto, createPayoutDto } from './dto/create-cryptomys.dto';

@Injectable()
export class CryptomusService {
  private readonly merchantId: '';
  private readonly paymentApiKey: '';
  private readonly payoutApiKey: '';

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    @InjectModel(Payout) private readonly payoutRepository: typeof Payout,
    @InjectModel(SuccessPayout)
    private readonly successPayoutRepository: typeof SuccessPayout,
    @InjectModel(FailedPayout)
    private readonly failedPayoutRepository: typeof FailedPayout,
    @InjectModel(Payment) private readonly paymentRepository: typeof Payment,
    @InjectModel(Payment)
    private readonly successPaymentRepository: typeof SuccessPayment,
    @InjectModel(FailedPayment)
    private readonly failedPaymentRepository: typeof FailedPayment,
  ) {
    this.paymentApiKey = this.configService.get('crypto_api_key');
    this.merchantId = this.configService.get('crypto_merchant');
    this.payoutApiKey = this.configService.get('crypto_api_key_payout');
  }

  public async createPayment(dto: createPaymentDto, user: User) {
    const { amount, currency } = dto;
    try {
      const payload = {
        amount: '' + amount,
        currency,
        order_id: uuidv4(),
      };
      const header = await this.cryptoHeader(
        JSON.stringify(payload),
        this.paymentApiKey,
      );
      const { data } = await instance.post('/v1/payment', payload, {
        headers: {
          'Content-Type': 'application/json',
          merchant: header.merchant,
          sign: header.sign,
        },
      });

      await this.paymentRepository.create({
        user: user.id,
        order_id: data.result.order_id,
        uuid: data.result.uuid,
        amount: Number(data.result.amount),
        currency: data.result.currency,
        isFinal: data.result.is_final,
        status: data.result.status,
        paymentUrl: data.result.url,
        // network: data.result.network,
        // address: data.result.address,
      });

      return data.result;
    } catch (error) {
      throw new Error(error);
    }
  }

  public async createPayout(user: User, dto: createPayoutDto) {
    const { amount, currency, address } = dto;
    try {
      const currentUser = await this.usersService.publicUser(user.email);

      if (currentUser.wallet < amount) {
        return new ConflictException(
          AppError.INSUFFICIENT_FUNDS_ON_THE_ACCOUNT,
        );
      }
      const order_id = uuidv4();
      const payload = {
        amount: String(amount),
        currency,
        network: 'tron',
        order_id,
        address,
        is_subtract: '0',
      };

      const header = await this.cryptoHeader(
        JSON.stringify(payload),
        this.payoutApiKey,
      );

      const { data } = await instance.post('/v1/payout', payload, {
        headers: {
          'Content-Type': 'application/json',
          merchant: header.merchant,
          sign: header.sign,
        },
      });

      return await this.failedPaymentRepository.create({
        data: {
          userId: currentUser.id,
          orderId: order_id,
          uuid: data.result.uuid,
          amount: Number(data.result.amount),
          address: data.result.address,
          status: data.ruselt.status,
          isFinal: data.result.is_final,
          currency: data.result.currency,
          network: data.result.network,
        },
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  // @Cron('45 * * * * *')
  private async checkPayment() {
    try {
      const payments = await this.paymentRepository.findAll();
      console.log('start method chekpayment');

      for (const payment of payments) {
        const payload = {
          order_id: payment.order_id,
        };

        const header = await this.cryptoHeader(
          JSON.stringify(payload),
          this.paymentApiKey,
        );

        const { data } = await instance.post('/v1/payment/info', payload, {
          headers: {
            'Content-Type': 'application/json',
            merchant: header.merchant,
            sign: header.sign,
          },
        });
        if (
          data.result.status === PaymentStatus.CANCEL ||
          data.result.status === PaymentStatus.SYSTEM_FAIL ||
          data.result.status === PaymentStatus.FAIL
        ) {
          await this.failedPaymentRepository.create({
            data: {
              userId: payment.user,
              order_id: payment.order_id,
              uuid: payment.uuid,
              amount: payment.amount,
              currency: payment.currency,
            },
          });

          await payment.destroy();
        }
        if (
          data.result.status === PaymentStatus.PAID ||
          data.result.status === PaymentStatus.PAID_OVER ||
          data.result.status === PaymentStatus.WRONG_AMOUNT ||
          data.result.status === PaymentStatus.WRONG_AMOUNT_WAITING
        ) {
          const user = await this.usersService.getUserById(+payment.user);
          const walletAmount = user.wallet + Number(data.result.amount);
          await this.usersService.updateWallet(walletAmount, +payment.user);
          await this.successPaymentRepository.create({
            data: {
              userId: payment.user,
              order_id: payment.order_id,
              uuid: payment.uuid,
              amount: Number(data.result.amount),
              currency: payment.currency,
              status: data.result.status,
              address: data.result.address,
              network: data.result.network,
            },
          });
          await payment.destroy();
        }
        return data.result;
      }
      Logger.error('failed check payment');
    } catch (error) {
      Logger.error('failed check payment');
      throw new Error(error);
    }
  }

  // @Cron('45 * * * * *')
  private async checkPayout() {
    try {
      const payouts = await this.payoutRepository.findAll();

      for (const element of payouts) {
        const payload = {
          uuid: element.uuid,
        };

        const header = await this.cryptoHeader(
          JSON.stringify(payload),
          this.payoutApiKey,
        );

        const { data } = await instance.post('/v1/payout/info', payload, {
          headers: {
            'Content-Type': 'application/json',
            merchant: header.merchant,
            sign: header.sign,
          },
        });

        if (
          data.result.status === PaymentStatus.CANCEL ||
          data.result.status === PaymentStatus.FAIL ||
          data.result.status === PaymentStatus.SYSTEM_FAIL
        ) {
          await this.failedPayoutRepository.create({
            data: {
              userId: element.user,
              orderId: element.order_id,
              uuid: element.uuid,
              amount: element.amount,
              network: element.network,
              status: data.result.status,
              address: element.address,
            },
          });

          await element.destroy();
        }

        if (data.result.status === PaymentStatus.PAID) {
          await this.successPayoutRepository.create({
            data: {
              userId: element.user,
              orderId: element.order_id,
              uuid: element.uuid,
              amount: element.amount,
              network: element.network,
              status: data.result.status,
              address: element.address,
              currency: element.currency,
            },
          });

          await element.destroy();
        }
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  private async cryptoHeader(payload: string, api_key: string) {
    const sign = crypto
      .createHash('md5')
      .update(Buffer.from(payload).toString('base64') + api_key)
      .digest('hex');
    return {
      merchant: this.merchantId,
      sign,
    };
  }
}
