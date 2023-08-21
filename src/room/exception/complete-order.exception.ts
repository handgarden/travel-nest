import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class CompleteOrderException extends CustomHttpException {
  constructor() {
    super('이미 완료된 주문입니다.', HttpStatus.BAD_REQUEST);
  }
}
