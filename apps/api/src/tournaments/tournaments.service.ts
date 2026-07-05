import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/prisma';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { RedisService } from '@app/redis';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @InjectQueue('tournament-snapshot') private snapshotQueue: Queue,
  ) {}

  async create(dto: CreateTournamentDto) {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);

    if (endsAt <= startsAt) {
      throw new BadRequestException('endsAt must be after startsAt');
    }

    const delay = endsAt.getTime() - Date.now();
    if (delay <= 0) {
      throw new BadRequestException('endsAt must be in the future');
    }

    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        startsAt,
        endsAt,
        status: 'PENDING',
      },
    });

    await this.snapshotQueue.add(
      'snapshot',
      { tournamentId: tournament.id },
      { delay },
    );

    return { id: tournament.id };
  }

  async getLeaderboard(id: string, limit: number, offset: number) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    if (tournament.status === 'COMPLETED') {
      const results = await this.prisma.tournamentResult.findMany({
        where: { tournamentId: id },
        orderBy: { rank: 'asc' },
        skip: offset,
        take: limit,
      });
      return results.map(r => ({
        playerId: r.playerId,
        score: r.score,
        rank: r.rank,
      }));
    }

    // Pending or Active: get from Redis
    const key = `tournament:${id}:leaderboard`;
    const redisResults = await this.redis.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES');
    
    const formatted: { playerId: string; score: number; rank: number }[] = [];
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
