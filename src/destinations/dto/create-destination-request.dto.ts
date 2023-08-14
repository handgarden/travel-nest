import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Category } from '../category.enum';

export class CreateDestinationRequest {
  @IsString()
  @Length(1, 30)
  title: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  category: Category;
}
