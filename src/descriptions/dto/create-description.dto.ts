import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDescriptionRequest {
  @IsNotEmpty()
  @IsNumber()
  destinationId: number;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  storeFileNames: string[];
}
