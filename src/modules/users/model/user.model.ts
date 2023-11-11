import { Column, HasMany, Model, Table } from 'sequelize-typescript';
import {
  FailedPayment,
  Payment,
  SuccessPayment,
} from 'src/modules/cryptomus/model/payment.model';

@Table
export class User extends Model {
  @Column
  email: string;

  @Column
  name: string;

  @Column
  password: string;

  @Column
  wallet: number;

  @HasMany(() => Payment, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  payment: Payment[];

  @HasMany(() => SuccessPayment)
  successPayment: SuccessPayment[];

  @HasMany(() => FailedPayment)
  failedPayment: FailedPayment[];
}
