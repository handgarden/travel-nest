import { Role } from 'src/member/enum/Role';

export type JwtPayload = {
  sub: number;
  nickname: string;
  role: Role;
};
