import { IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateCreditCardRequest {
  @Length(1, 16)
  @IsNotEmpty()
  cardOwner: string;

  @IsNotEmpty()
  @Length(16, 16)
  @Matches(/^[0-9]+$/)
  cardNumber: string;

  @IsNotEmpty()
  @Length(4, 16)
  cardName: string;
}
