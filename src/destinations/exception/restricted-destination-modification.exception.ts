import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class RestrictedDestinationModificationException extends CustomHttpException {
  constructor() {
    super(
      'Cannot be edited or deleted for destinations with reviews',
      HttpStatus.BAD_REQUEST,
    );
  }
}
