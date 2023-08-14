import {
  HttpException,
  HttpExceptionOptions,
  HttpStatus,
} from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    options?: HttpExceptionOptions,
  ) {
    super(message, status, options);
  }
}
