import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DuplicateRoomException extends CustomHttpException {
  constructor() {
    super('room duplicate', HttpStatus.BAD_REQUEST);
  }
}
