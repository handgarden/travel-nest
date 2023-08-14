import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { NUM_AND_ALPHABET_ONLY, PASSWORD_REGEX } from '../lib/regex';

export const NoSpecialCharacters = (message?: string) => {
  return applyDecorators(
    Matches(/^(?!.*[{}\[\]/?.,;:|)*~`!^\-+<>@#$%&\\=('\"]).*/, { message }),
  );
};

export const PasswordRules = (message?: string) => {
  return applyDecorators(Matches(PASSWORD_REGEX, { message }));
};

export const NumberAndAlphabetOnly = (message?: string) => {
  return applyDecorators(Matches(NUM_AND_ALPHABET_ONLY, { message }));
};
