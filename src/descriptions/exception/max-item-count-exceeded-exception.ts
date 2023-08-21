import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class MaxItemCountExceededError extends CustomHttpException {
  constructor(maxCount?: number) {
    super(
      `컨텐츠는 최대 ${maxCount || 5}개까지 추가할 수 있습니다.`,
      HttpStatus.BAD_REQUEST,
    );
  }
}
