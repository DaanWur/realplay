import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';

@Controller('bet')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async ingest(@Body() createBetDto: CreateBetDto): Promise<{
    status: string;
    processedCount: number;
    duplicateCount: number;
  }> {
    return this.betsService.ingest(createBetDto);
  }
}
