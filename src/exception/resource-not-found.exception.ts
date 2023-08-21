import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from './custom-http.exception';

export class ResourceNotFoundException extends CustomHttpException {
  constructor() {
    super('요청한 리소스를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
  }
}
