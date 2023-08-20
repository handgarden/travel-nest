import { PaymentType } from '../entities/payment-type.enum';

export class ProcessPaymentRequest {
  memberId: number;
  paymentType: PaymentType;
  paymentId: number;
  price: number;
}
