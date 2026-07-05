import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { BetsService } from './bets.service';
import { CreateBetDto } from './dto/create-bet.dto';

describe('BetsService', () => {
  let service: BetsService;
  let prisma: {
    tournament: { findMany: jest.Mock };
    tournamentBet: { create: jest.Mock };
  };
  let redis: { zincrby: jest.Mock };

  const tournament = { id: 'tourney-1' };
  const bet: CreateBetDto = {
    externalBetId: 'bet_123456',
    playerId: 'player_42',
    amount: 250,
    currency: 'USD',
    createdAt: '2026-06-04T12:30:00.000Z',
  };

  beforeEach(async () => {
    prisma = {
      tournament: { findMany: jest.fn().mockResolvedValue([tournament]) },
      tournamentBet: { create: jest.fn().mockResolvedValue({}) },
    };
    redis = { zincrby: jest.fn().mockResolvedValue(1) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BetsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile();

    service = module.get<BetsService>(BetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('ingests a bet and increments the tournament leaderboard by the bet amount', async () => {
    const result = await service.ingest(bet);

    expect(prisma.tournamentBet.create).toHaveBeenCalledWith({
      data: {
        tournamentId: tournament.id,
        externalBetId: bet.externalBetId,
        playerId: bet.playerId,
        amount: bet.amount,
        currency: bet.currency,
        createdAt: new Date(bet.createdAt),
      },
    });
    expect(redis.zincrby).toHaveBeenCalledWith(
      `tournament:${tournament.id}:leaderboard`,
      bet.amount,
      bet.playerId,
    );
    expect(result).toEqual({
      status: 'ok',
      processedCount: 1,
      duplicateCount: 0,
    });
  });

  it('treats a duplicate externalBetId as an idempotent no-op without double-counting the score', async () => {
    prisma.tournamentBet.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.8.0',
      }),
    );

    await expect(service.ingest(bet)).resolves.toEqual({
      status: 'ok',
      processedCount: 0,
      duplicateCount: 1,
    });

    expect(redis.zincrby).not.toHaveBeenCalled();
  });

  it('rejects a bet that does not fall within any active tournament window', async () => {
    prisma.tournament.findMany.mockResolvedValue([]);

    await expect(service.ingest(bet)).rejects.toThrow(BadRequestException);
    expect(prisma.tournamentBet.create).not.toHaveBeenCalled();
    expect(redis.zincrby).not.toHaveBeenCalled();
  });
});
