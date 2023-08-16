import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class MaxFileCountExceededException extends CustomHttpException {
  constructor() {
    super('max number of files exceeded', HttpStatus.BAD_REQUEST);
  }
}
