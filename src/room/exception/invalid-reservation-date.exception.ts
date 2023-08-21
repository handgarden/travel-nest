import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class InvalidReservationDateException extends CustomHttpException {
  constructor() {
    super('예약 날짜를 확인해주세요.', HttpStatus.BAD_REQUEST);
  }
}
