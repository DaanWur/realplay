import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { BetResultDto } from './dto/bet-result.dto';

@Controller('bet')
export class BetsController {
  constructor(private readonly betsService: BetsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async bet(@Body() createBetDto: CreateBetDto): Promise<BetResultDto> {
    return this.betsService.bet(createBetDto);
  }
}
