import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './decorator/authorization.decorator';
import { Role } from 'src/member/enum/Role';
import { JwtMemberDto } from 'src/auth/dto/jwt-member.dto';

/**
 * 권한 검증을 위해서 필수로 AuthGuard를 우선 적용해야함
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    //AuthGuard 이후에 적용되는 가드로 로그인이 필요한 경로면 user가 무조건 있음, 없으면 이미 예외 던져서 여기로 안옴
    const user: JwtMemberDto = context.switchToHttp().getRequest().user;

    if (!user) {
      return true;
    }

    const handler = context.getHandler();
    const cl = context.getClass();
    //권한 검증
    const requiedRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      handler,
      cl,
    ]);

    if (!requiedRoles.includes(user.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
