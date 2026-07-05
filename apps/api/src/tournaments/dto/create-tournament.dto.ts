import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateTournamentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @IsDateString()
  @IsNotEmpty()
  endsAt: string;
}
