import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class BalanceInsufficientException extends CustomHttpException {
  constructor() {
    super('balance insufficient', HttpStatus.BAD_REQUEST);
  }
}
