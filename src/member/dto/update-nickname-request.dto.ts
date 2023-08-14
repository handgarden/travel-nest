import { NoSpecialCharacters } from 'src/auth/decorator/validation.decorator';

export class UpdateNicknameRequest {
  @NoSpecialCharacters()
  nickname: string;

  constructor(nickname?: string) {
    this.nickname = nickname;
  }
}
