import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DuplicateNicknameException extends CustomHttpException {
  constructor() {
    super('duplicate nickname', HttpStatus.BAD_REQUEST);
  }
}
