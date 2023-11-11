import { IsString, IsNumber } from 'class-validator';

export class createPayoutDto {
  @IsString()
  address: string;

  @IsString()
  currency: string;

  @IsNumber()
  amount: number;
}
export class createPaymentDto {
  @IsString()
  currency: string;

  @IsNumber()
  amount: number;
}
