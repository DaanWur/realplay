import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma, Tournament } from '@prisma/client';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { CreateBetDto } from './dto/create-bet.dto';
import { BetResultDto } from './dto/bet-result.dto';

type BetOutcome = 'processed' | 'duplicate';

@Injectable()
export class BetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async bet(dto: CreateBetDto): Promise<BetResultDto> {
    const betTime = new Date(dto.createdAt);
    const activeTournaments = await this.findActiveTournaments(betTime);

    if (activeTournaments.length === 0) {
      throw new BadRequestException(
        'Bet does not qualify for any active tournament',
      );
    }

    // Process all matching tournaments concurrently instead of one round-trip at a time.
    const outcomes = await Promise.all(
      activeTournaments.map((tournament) =>
        this.recordBet(tournament, dto, betTime),
      ),
    );

    return {
      status: 'ok',
      processedCount: outcomes.filter((o) => o === 'processed').length,
      duplicateCount: outcomes.filter((o) => o === 'duplicate').length,
    };
  }

  private findActiveTournaments(betTime: Date): Promise<Tournament[]> {
    // A bet counts only while startsAt <= createdAt <= endsAt.
    return this.prisma.tournament.findMany({
      where: {
        status: { in: ['PENDING', 'ACTIVE'] },
        startsAt: { lte: betTime },
        endsAt: { gte: betTime },
      },
    });
  }

  private async recordBet(
    tournament: Tournament,
    dto: CreateBetDto,
    betTime: Date,
  ): Promise<BetOutcome> {
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

      await this.redis.zincrby(
        `tournament:${tournament.id}:leaderboard`,
        dto.amount,
        dto.playerId,
      );
      return 'processed';
    } catch (error) {
      // P2002 is Prisma's code for Unique constraint failed: this externalBetId was
      // already counted for this tournament. Treat as an idempotent no-op, not an error.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return 'duplicate';
      }
      throw error;
    }
  }
}
