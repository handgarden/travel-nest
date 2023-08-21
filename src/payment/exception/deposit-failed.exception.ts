import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DepositFailedException extends CustomHttpException {
  constructor() {
    super('충전에 실패했습니다.', HttpStatus.BAD_REQUEST);
  }
}
