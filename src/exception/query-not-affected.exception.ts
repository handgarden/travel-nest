import { HttpExceptionOptions, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class QueryNotAffectedException extends CustomHttpException {
  constructor(options?: HttpExceptionOptions) {
    super('server error', HttpStatus.INTERNAL_SERVER_ERROR, options);
  }
}
