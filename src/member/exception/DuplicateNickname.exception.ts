import { HttpException, HttpStatus } from '@nestjs/common';

export class DuplicateNicknameException extends HttpException {
  constructor() {
    super('duplicate nickname', HttpStatus.BAD_REQUEST);
  }
}
