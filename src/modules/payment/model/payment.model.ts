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
  amount: string;

  @Column
  currency: string;

  @Column
  status: string;

  @Column
  isFinal: boolean;

  @Column
  address: string;

  @Column
  network: string;
}

@Table
export class SuccessPayment extends Model {
  @Column
  order_id: string;

  @Column
  uuid: string;

  @Column
  amount: string;

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
  amount: string;

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
