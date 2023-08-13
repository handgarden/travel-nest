import { NoSpecialCharacters } from 'src/auth/decorator/validation.decorator';

export class UpdateNicknameDto {
  @NoSpecialCharacters()
  nickname: string;

  constructor(nickname?: string) {
    this.nickname = nickname;
  }
}
