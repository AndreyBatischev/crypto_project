import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from 'src/modules/users/model/user.model';

@Table
export class Payment extends Model {
  @ForeignKey(() => User)
  user: User;

  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  currency: string;

  @Column
  status: string;

  @Column
  paymentUrl: string;

  @Column
  isFinal: boolean;
}

@Table
export class SuccessPayment extends Model {
  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  currency: string;

  @Column
  status: string;

  @Column
  address: string;

  @Column
  network: string;

  @ForeignKey(() => User)
  user: User;
}

@Table
export class FailedPayment extends Model {
  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  currency: string;

  @ForeignKey(() => User)
  user: User;
}

@Table
export class Payout extends Model {
  @ForeignKey(() => User)
  user: User;

  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  address: string;

  @Column
  status: string;

  @Column
  currency: string;

  @Column
  isFinal: string;

  @Column
  network: string;
}

@Table
export class SuccessPayout extends Model {
  @ForeignKey(() => User)
  user: User;

  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  address: string;

  @Column
  status: string;

  @Column
  currency: string;

  @Column
  network: string;
}

@Table
export class FailedPayout extends Model {
  @ForeignKey(() => User)
  user: User;

  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: number;

  @Column
  address: string;

  @Column
  status: string;

  @Column
  currency: string;

  @Column
  network: string;
}
