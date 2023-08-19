import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class InvalidReservationDateException extends CustomHttpException {
  constructor() {
    super('invalid reservation date', HttpStatus.BAD_REQUEST);
  }
}
