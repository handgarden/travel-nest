import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';
import { Pageable } from '../pageable.dto';

export const PageRequest = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const params = request.query;

    return new Pageable(params.page, params.size);
  },
);
