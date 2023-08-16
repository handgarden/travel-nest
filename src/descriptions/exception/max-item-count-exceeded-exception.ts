import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class MaxItemCountExceededError extends CustomHttpException {
  constructor() {
    super('max item count exceeded', HttpStatus.BAD_REQUEST);
  }
}
