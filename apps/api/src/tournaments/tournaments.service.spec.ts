import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { TournamentsService } from './tournaments.service';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let prisma: {
    tournament: { findUnique: jest.Mock; create: jest.Mock };
    tournamentResult: { findMany: jest.Mock };
  };
  let redis: { zrevrange: jest.Mock };
  let queue: { add: jest.Mock };

  beforeEach(async () => {
    prisma = {
      tournament: { findUnique: jest.fn(), create: jest.fn() },
      tournamentResult: { findMany: jest.fn() },
    };
    redis = { zrevrange: jest.fn() };
    queue = { add: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
        { provide: getQueueToken('tournament-snapshot'), useValue: queue },
      ],
    }).compile();

    service = module.get<TournamentsService>(TournamentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns the live leaderboard from Redis sorted by score descending', async () => {
    prisma.tournament.findUnique.mockResolvedValue({ id: 't1', status: 'ACTIVE' });
    redis.zrevrange.mockResolvedValue(['player_1', '500', 'player_2', '300', 'player_3', '100']);

    const result = await service.getLeaderboard('t1', 10, 0);

    expect(redis.zrevrange).toHaveBeenCalledWith('tournament:t1:leaderboard', 0, 9, 'WITHSCORES');
    expect(result).toEqual([
      { playerId: 'player_1', score: 500, rank: 1 },
      { playerId: 'player_2', score: 300, rank: 2 },
      { playerId: 'player_3', score: 100, rank: 3 },
    ]);
  });

  it('applies offset to computed ranks for paginated Redis results', async () => {
    prisma.tournament.findUnique.mockResolvedValue({ id: 't1', status: 'ACTIVE' });
    redis.zrevrange.mockResolvedValue(['player_3', '100']);

    const result = await service.getLeaderboard('t1', 10, 2);

    expect(redis.zrevrange).toHaveBeenCalledWith('tournament:t1:leaderboard', 2, 11, 'WITHSCORES');
    expect(result).toEqual([{ playerId: 'player_3', score: 100, rank: 3 }]);
  });

  it('returns the final placements from Postgres, ordered by rank, once completed', async () => {
    prisma.tournament.findUnique.mockResolvedValue({ id: 't1', status: 'COMPLETED' });
    prisma.tournamentResult.findMany.mockResolvedValue([
      { playerId: 'player_1', score: 500, rank: 1 },
      { playerId: 'player_2', score: 300, rank: 2 },
    ]);

    const result = await service.getLeaderboard('t1', 10, 0);

    expect(prisma.tournamentResult.findMany).toHaveBeenCalledWith({
      where: { tournamentId: 't1' },
      orderBy: { rank: 'asc' },
      skip: 0,
      take: 10,
    });
    expect(redis.zrevrange).not.toHaveBeenCalled();
    expect(result).toEqual([
      { playerId: 'player_1', score: 500, rank: 1 },
      { playerId: 'player_2', score: 300, rank: 2 },
    ]);
  });
});
