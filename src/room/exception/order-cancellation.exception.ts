import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class OrderCancellationException extends CustomHttpException {
  constructor() {
    super('예약 취소에 오류가 발생했습니다.', HttpStatus.BAD_REQUEST);
  }
}
