import { DefaultEntity } from 'src/common/entity/default.entity';
import { Column, ManyToOne } from 'typeorm';
import { CreditCard } from './credit-card.entity';
import { PaymentType } from './payment-type.enum';
import { TravelPay } from './travel-pay.entity';

export abstract class OrderTypeEntity extends DefaultEntity {
  @Column()
  paymentType: PaymentType;

  @ManyToOne(() => CreditCard, { nullable: true })
  creditCard: Promise<CreditCard>;

  @ManyToOne(() => TravelPay, { nullable: true })
  travelPay: Promise<TravelPay>;
}
