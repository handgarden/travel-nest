import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class EmptyFileListException extends CustomHttpException {
  constructor() {
    super('empty file list', HttpStatus.BAD_REQUEST);
  }
}
