import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class BadCategoryException extends CustomHttpException {
  constructor() {
    super('bad category', HttpStatus.BAD_REQUEST);
  }
}
