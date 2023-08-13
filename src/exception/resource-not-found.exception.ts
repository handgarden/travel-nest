import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class ResourceNotFoundException extends CustomHttpException {
  constructor() {
    super('resource not found', HttpStatus.NOT_FOUND);
  }
}
