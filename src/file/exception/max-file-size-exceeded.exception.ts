import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class MaxFileSizeExceedException extends CustomHttpException {
  constructor() {
    super('max file size exceeded', HttpStatus.BAD_REQUEST);
  }
}
