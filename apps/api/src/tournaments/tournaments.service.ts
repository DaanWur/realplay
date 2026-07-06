import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Tournament } from '@prisma/client';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { RedisService } from '@app/redis';
import { LeaderboardDto } from './dto/leaderboard.dto';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('tournament-snapshot') private snapshotQueue: Queue,
  ) {}

  async create(dto: CreateTournamentDto): Promise<{ id: string }> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    const delay = this.getSnapshotDelay(startsAt, endsAt);

    const tournament = await this.persistTournament(dto.name, startsAt, endsAt);
    await this.scheduleSnapshotJob(tournament.id, delay);

    return { id: tournament.id };
  }

  async getLeaderboard(
    id: string,
    limit: number,
    offset: number,
  ): Promise<LeaderboardDto[]> {
    const tournament = await this.findTournamentOrThrow(id);

    if (tournament.status === 'COMPLETED') {
      return this.getFinalLeaderboard(id, limit, offset);
    }

    return this.getLiveLeaderboard(id, limit, offset);
  }

  private getSnapshotDelay(startsAt: Date, endsAt: Date): number {
    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const delay = endsAt.getTime() - Date.now();
    if (delay <= 0) {
      throw new BadRequestException('endsAt must be in the future');
    }

    return delay;
  }

  private persistTournament(
    name: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<Tournament> {
    return this.prisma.tournament.create({
      data: { name, startsAt, endsAt, status: 'PENDING' },
    });
  }

  private scheduleSnapshotJob(
    tournamentId: string,
    delay: number,
  ): Promise<unknown> {
    return this.snapshotQueue.add('snapshot', { tournamentId }, { delay });
  }

  private async findTournamentOrThrow(id: string): Promise<Tournament> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    return tournament;
  }

  private async getFinalLeaderboard(
    tournamentId: string,
    limit: number,
    offset: number,
  ): Promise<LeaderboardDto[]> {
    const results = await this.prisma.tournamentResult.findMany({
      where: { tournamentId },
      orderBy: { rank: 'asc' },
      skip: offset,
      take: limit,
    });

    return results.map((r) => ({
      playerId: r.playerId,
      score: r.score,
      rank: r.rank,
    }));
  }

  private async getLiveLeaderboard(
    tournamentId: string,
    limit: number,
    offset: number,
  ): Promise<LeaderboardDto[]> {
    const key = `tournament:${tournamentId}:leaderboard`;
    const redisResults = await this.redis.zrevrange(
      key,
      offset,
      offset + limit - 1,
      'WITHSCORES',
    );

    return this.parseRedisLeaderboard(redisResults, offset);
  }

  private parseRedisLeaderboard(
    redisResults: string[],
    offset: number,
  ): LeaderboardDto[] {
    const formatted: LeaderboardDto[] = [];
    for (let i = 0; i < redisResults.length; i += 2) {
      formatted.push({
        playerId: redisResults[i],
        score: parseInt(redisResults[i + 1], 10),
        rank: offset + Math.floor(i / 2) + 1,
      });
    }

    return formatted;
  }
}
