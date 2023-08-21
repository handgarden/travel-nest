import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class OutOfStockException extends CustomHttpException {
  constructor() {
    super('재고가 없습니다.', HttpStatus.BAD_REQUEST);
  }
}
