import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  async create(
    @Body() createTournamentDto: CreateTournamentDto,
  ): Promise<{ id: string }> {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get(':id/leaderboard')
  async getLeaderboard(
    @Param('id') id: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<{ playerId: string; score: number; rank: number }[]> {
    return this.tournamentsService.getLeaderboard(id, limit, offset);
  }
}
