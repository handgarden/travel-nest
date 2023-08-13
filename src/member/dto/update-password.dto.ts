import { PasswordRules } from 'src/auth/decorator/validation.decorator';

export class UpdatePasswordDto {
  prevPassword: string;

  @PasswordRules()
  newPassword: string;

  constructor(prevPassword?: string, newPassword?: string) {
    this.prevPassword = prevPassword;
    this.newPassword = newPassword;
  }
}
