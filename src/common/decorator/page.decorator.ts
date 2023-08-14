import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

/**
 * 페이지 요청 정보 Pageable
 * @field page 요청 페이지 - 기본 값 0
 * @field size 페이지 사이즈 - 기본 값 10
 */
export class Pageable {
  page: number;
  size: number;
}

export const PageRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const params = request.params;

    const pagable = new Pageable();
    pagable.page = params.page ? parseInt(params.page) : 0;
    pagable.size = params.size ? parseInt(params.size) : 10;
    return pagable;
  },
);
