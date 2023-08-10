import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateAccountException extends HttpException {
  constructor() {
    super('duplicate account', HttpStatus.BAD_REQUEST);
  }
}
