import { IsNotEmpty, IsString, Length } from 'class-validator';
import {
  NoSpecialCharacters,
  NumberAndAlphabetOnly,
  PasswordRules,
} from 'src/auth/decorator/validation.decorator';

export class RegisterDto {
  @IsNotEmpty()
  @Length(4, 20)
  @NumberAndAlphabetOnly()
  account: string;

  @IsNotEmpty()
  @Length(8, 20)
  @PasswordRules()
  password: string;

  @IsString()
  @Length(4, 20)
  @NoSpecialCharacters()
  nickname: string;
}
