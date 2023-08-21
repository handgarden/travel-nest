import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class BadCategoryException extends CustomHttpException {
  constructor() {
    super('카테고리를 제대로 선택해주세요.', HttpStatus.BAD_REQUEST);
  }
}
