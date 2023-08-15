import { IsNotEmpty, Length } from 'class-validator';

export class UpdateDestinationRequest {
  @IsNotEmpty()
  @Length(1, 30)
  title: string;

  @IsNotEmpty()
  address: string;
}
