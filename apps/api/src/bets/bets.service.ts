import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { CreateBetDto } from './dto/create-bet.dto';

@Injectable()
export class BetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async ingest(dto: CreateBetDto): Promise<{
    status: string;
    processedCount: number;
    duplicateCount: number;
  }> {
    const betTime = new Date(dto.createdAt);

    // 1. Query Postgres for all tournaments where startsAt <= bet.createdAt <= endsAt
    const activeTournaments = await this.prisma.tournament.findMany({
      where: {
        status: { in: ['PENDING', 'ACTIVE'] },
        startsAt: { lte: betTime },
        endsAt: { gte: betTime },
      },
    });

    if (activeTournaments.length === 0) {
      throw new BadRequestException(
        'Bet does not qualify for any active tournament',
      );
    }

    let processedCount = 0;
    let duplicateCount = 0;

    // 3. For each matching tournament
    for (const tournament of activeTournaments) {
      try {
        await this.prisma.tournamentBet.create({
          data: {
            tournamentId: tournament.id,
            externalBetId: dto.externalBetId,
            playerId: dto.playerId,
            amount: dto.amount,
            currency: dto.currency,
            createdAt: betTime,
          },
        });

        // If insert succeeds, update Redis Leaderboard
        const key = `tournament:${tournament.id}:leaderboard`;
        await this.redis.zincrby(key, dto.amount, dto.playerId);
        processedCount++;
      } catch (error) {
        // P2002 is Prisma's code for Unique constraint failed: this externalBetId was
        // already counted for this tournament. Treat as an idempotent no-op, not an error.
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          duplicateCount++;
          continue;
        }
        throw error;
      }
    }

    return { status: 'ok', processedCount, duplicateCount };
  }
}
