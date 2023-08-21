import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class BalanceInsufficientException extends CustomHttpException {
  constructor() {
    super('잔액이 부족합니다.', HttpStatus.BAD_REQUEST);
  }
}
