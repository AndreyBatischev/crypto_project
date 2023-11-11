import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { JwtAuthGuard } from 'src/guards/jwt-guard';
import { createPaymentDto, createPayoutDto } from './dto/create-cryptomys.dto';

@Controller('cryptomus')
export class CryptomusController {
  constructor(private readonly cryptomusService: CryptomusService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-payment')
  createPayment(@Body() dto: createPaymentDto, @Req() request) {
    const user = request.user;
    return this.cryptomusService.createPayment(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-payout')
  createPayout(@Body() dto: createPayoutDto, @Req() request) {
    const user = request.user;
    return this.cryptomusService.createPayout(user, dto);
  }

  @Post('test')
  test() {
    return;
  }
}
