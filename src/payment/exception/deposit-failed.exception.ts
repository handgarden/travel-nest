import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DepositFailedException extends CustomHttpException {
  constructor() {
    super('deposit failed', HttpStatus.BAD_REQUEST);
  }
}
