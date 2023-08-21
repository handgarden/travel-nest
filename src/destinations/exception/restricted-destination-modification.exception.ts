import { HttpStatus } from '@nestjs/common';
import { CustomHttpException } from 'src/exception/custom-http.exception';

export class RestrictedDestinationModificationException extends CustomHttpException {
  constructor() {
    super(
      '후기가 존재하는 여행지는 수정, 제거할 수 없습니다.',
      HttpStatus.BAD_REQUEST,
    );
  }
}
