import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class EmptyContentException extends CustomHttpException {
  constructor() {
    super('emtpy content', HttpStatus.BAD_REQUEST);
  }
}
