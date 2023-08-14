import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class DuplicateDestinationException extends CustomHttpException {
  constructor() {
    super('duplicate destination', HttpStatus.BAD_REQUEST);
  }
}
