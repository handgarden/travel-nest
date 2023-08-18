import { IsNotEmpty } from 'class-validator';

export class UpdateDescriptionRequest {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  storeFileNames: string[];
}
