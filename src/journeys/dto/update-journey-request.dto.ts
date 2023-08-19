import {
  ArrayMaxSize,
  ArrayMinSize,
  IsNotEmpty,
  Length,
} from 'class-validator';

export class UpdateJourneyRequest {
  @IsNotEmpty()
  @Length(1, 30)
  title: string;

  @IsNotEmpty()
  @Length(20, 1000)
  review: string;

  @ArrayMaxSize(5)
  @ArrayMinSize(1)
  contents: number[];
}
