import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DuplicateAccountException extends CustomHttpException {
  constructor() {
    super('duplicate account', HttpStatus.BAD_REQUEST);
  }
}
