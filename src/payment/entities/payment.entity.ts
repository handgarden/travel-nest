import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentType } from './payment-type.enum';
import { CreditCard } from './credit-card.entity';
import { TravelPay } from './travel-pay.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: PaymentType;

  @OneToOne(() => CreditCard, { nullable: true })
  creditCard: CreditCard;

  @OneToOne(() => TravelPay, { nullable: true })
  travelPay: TravelPay;
}
