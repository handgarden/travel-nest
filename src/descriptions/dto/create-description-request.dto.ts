import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDescriptionRequest {
  @IsNotEmpty()
  @IsNumber()
  destinationId: number;

  content: string;

  storeFileNames: string[];
}
