import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class CreateJourneyDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @Length(20, 1000)
  review: string;

  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  contents: number[];
}
