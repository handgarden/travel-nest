import { PaymentMethodRequest } from 'src/payment/dto/payment-method-request.dto';

export class ReserveRoomDto {
  roomId: number;
  requestMemberId: number;
  requestMemberNickname: string;
  paymentMethod: PaymentMethodRequest;
  startDate: Date;
  endDate: Date;
}
