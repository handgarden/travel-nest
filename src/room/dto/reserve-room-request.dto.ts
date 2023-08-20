import { IsNotEmpty } from 'class-validator';
import { IsCustomDate } from 'src/common/validator/custom-date.validator';

export class ReserveRoomRequest {
  @IsNotEmpty()
  paymentMethod: any;

  @IsNotEmpty()
  @IsCustomDate()
  startDate: string;

  @IsNotEmpty()
  @IsCustomDate()
  endDate: string;
}
