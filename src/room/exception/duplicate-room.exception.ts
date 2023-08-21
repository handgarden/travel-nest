import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DuplicateRoomException extends CustomHttpException {
  constructor() {
    super('중복된 방이 존재합니다.', HttpStatus.BAD_REQUEST);
  }
}
