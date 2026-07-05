import { IsString, IsNotEmpty, IsInt, IsDateString, Min } from 'class-validator';

export class CreateBetDto {
  @IsString()
  @IsNotEmpty()
  externalBetId: string;

  @IsString()
  @IsNotEmpty()
  playerId: string;

  @IsInt()
  @Min(1)
  amount: number;

  @IsString()
  @IsNotEmpty()
  currency: string;

  @IsDateString()
  @IsNotEmpty()
  createdAt: string;
}
