import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class OutOfStockException extends CustomHttpException {
  constructor() {
    super('out of stock', HttpStatus.BAD_REQUEST);
  }
}
