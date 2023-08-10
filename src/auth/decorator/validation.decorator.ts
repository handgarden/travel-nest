import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { NUM_AND_ALPHABET_ONLY, PASSWORD_REGEX } from '../lib/regex';

export const NoSpecialCharacters = () => {
  return applyDecorators(
    Matches(/^(?!.*[{}\[\]/?.,;:|)*~`!^\-+<>@#$%&\\=('\"]).*/),
  );
};

export const PasswordRules = () => {
  return applyDecorators(Matches(PASSWORD_REGEX));
};

export const NumberAndAlphabetOnly = () => {
  return applyDecorators(Matches(NUM_AND_ALPHABET_ONLY));
};
