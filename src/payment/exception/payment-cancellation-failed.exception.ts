import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class PaymentCancellationFailedException extends CustomHttpException {
  constructor() {
    super('결제 취소에 실패했습니다.', HttpStatus.BAD_REQUEST);
  }
}
