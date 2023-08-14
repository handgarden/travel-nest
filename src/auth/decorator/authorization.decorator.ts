import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Role } from 'src/member/enum/Role';

type AuthorizationOptions = {
  roles?: Role[];
  allowGuest?: boolean;
};

export const ALLOW_GUEST_KEY = 'allowGuest';
export const ROLES_KEY = 'role';
export const APPLY_AUTH_KEY = 'applyAuth';

/**
 * 로그인 및 권한 설정
 * 데코레이터 적용시 로그인 검증 & 권한 검증
 * allowGuest 설정 시 상위 권한 무시하고 접근 가능
 * roles에 설정된 권한과 상위 권한만 접근 가능함
 * @param options roles, allowGuest
 * @returns SetMetadata, JwtAuthGuard, RolesGuard
 */
export const Authorization = (options?: AuthorizationOptions) => {
  let roles = [Role.USER, Role.MANAGER, Role.ADMIN];
  if (options?.roles && options.roles.length > 0) {
    roles = options.roles;
  }

  const allowGuest = options?.allowGuest || false;

  if (allowGuest) {
    return applyDecorators(
      SetMetadata(APPLY_AUTH_KEY, true),
      SetMetadata(ALLOW_GUEST_KEY, true),
    );
  }

  return applyDecorators(
    SetMetadata(APPLY_AUTH_KEY, true),
    SetMetadata(ROLES_KEY, roles),
    SetMetadata(ALLOW_GUEST_KEY, false),
  );
};
