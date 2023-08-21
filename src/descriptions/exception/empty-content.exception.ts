import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class EmptyContentException extends CustomHttpException {
  constructor() {
    super('내용이 없습니다.', HttpStatus.BAD_REQUEST);
  }
}
