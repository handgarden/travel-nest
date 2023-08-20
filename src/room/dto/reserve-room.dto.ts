import { PaymentMethodRequest } from 'src/payment/dto/payment-method-request.dto';

export class ReserveRoomDto {
  roomId: number;
  requestMemberId: number;
  paymentMethod: PaymentMethodRequest;
  startDate: Date;
  endDate: Date;
}
