import { Reflector } from '@nestjs/core';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import {
  ALLOW_GUEST_KEY,
  APPLY_AUTH_KEY,
} from './decorator/authorization.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const handler = context.getHandler();
    const cl = context.getClass();

    //검증 데코레이터를 적용했는지 확인
    const needAuth = this.reflector.getAllAndOverride<boolean>(APPLY_AUTH_KEY, [
      handler,
      cl,
    ]);

    //없으면 검증 없이 통과
    if (!needAuth) {
      return true;
    }

    //로그인 검증이 필요한 경우와 필요 없는 경우를 우선 구분
    //핸들러에 적용된 정보를 우선 적용
    const allowGuest = this.reflector.getAllAndOverride<boolean>(
      ALLOW_GUEST_KEY,
      [handler, cl],
    );

    //비로그인 허용하는 경우 검증 없이 통과
    if (allowGuest) {
      return true;
    }

    //로그인 검증
    //여기서 jwt strategy 호출해서 검증함
    return super.canActivate(context);
  }
}
