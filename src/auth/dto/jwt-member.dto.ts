import { Role } from '../../member/enum/Role';

export class JwtMemberDto {
  readonly id: number;
  readonly nickname: string;
  readonly role: Role;

  constructor(id: number, nickname: string, role: Role) {
    this.id = id;
    this.nickname = nickname;
    this.role = role;
  }
}
