import { PaymentMethodRequest } from './../../payment/dto/payment-method-request.dto';
import { IsNotEmpty } from 'class-validator';
import { IsCustomDate } from 'src/common/validator/custom-date.validator';

export class ReserveRoomRequest {
  @IsNotEmpty()
  paymentMethod: PaymentMethodRequest;

  @IsNotEmpty()
  @IsCustomDate()
  startDate: string;

  @IsNotEmpty()
  @IsCustomDate()
  endDate: string;
}
