import { PasswordRules } from 'src/auth/decorator/validation.decorator';

export class UpdatePasswordDto {
  prevPassword: string;

  @PasswordRules()
  newPassword: string;
}
