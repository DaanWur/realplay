import { IsNumber, IsString } from 'class-validator';

export class BetResultDto {
  @IsString()
  status: string;

  @IsNumber()
  processedCount: number;

  @IsNumber()
  duplicateCount: number;
}
