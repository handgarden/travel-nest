import { CustomHttpException } from './../../exception/custom-http.exception';
import { HttpStatus } from '@nestjs/common';

export class CancellationTimeoutException extends CustomHttpException {
  constructor() {
    super('취소 가능한 시간이 지났습니다.', HttpStatus.BAD_REQUEST);
  }
}
