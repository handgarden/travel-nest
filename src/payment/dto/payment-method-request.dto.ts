import { IsNotEmpty } from 'class-validator';
import { PaymentType } from '../entities/payment-type.enum';

export class PaymentMethodRequest {
  @IsNotEmpty()
  paymentMethodId: number;

  @IsNotEmpty()
  paymentType: PaymentType;
}
