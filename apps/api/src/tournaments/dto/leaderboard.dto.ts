import { IsNumber, IsString } from 'class-validator';

export class LeaderboardDto {
  @IsString()
  playerId: string;

  @IsNumber()
  score: number;

  @IsNumber()
  rank: number;
}
