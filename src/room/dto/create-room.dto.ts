import { IsMilitaryTime, IsNotEmpty, Length, Max, Min } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  destinationId: number;

  @IsNotEmpty()
  @Length(4, 16)
  name: string;

  @IsNotEmpty()
  @Min(5000)
  @Max(Number.MAX_VALUE)
  price: number;

  @IsNotEmpty()
  @Min(1)
  @Max(1000)
  stock: number;

  @IsMilitaryTime()
  inTime: string;
}
