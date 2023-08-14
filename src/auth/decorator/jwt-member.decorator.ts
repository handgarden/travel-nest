import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtMemberDto } from '../dto/jwt-member.dto';

export const JwtMember = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as JwtMemberDto;
});
