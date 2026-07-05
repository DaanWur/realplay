import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

describe('TournamentsController', () => {
  let controller: TournamentsController;
  let service: { create: jest.Mock; getLeaderboard: jest.Mock };

  beforeEach(async () => {
    service = { create: jest.fn(), getLeaderboard: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentsController],
      providers: [{ provide: TournamentsService, useValue: service }],
    }).compile();

    controller = module.get<TournamentsController>(TournamentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates leaderboard queries with parsed pagination params', async () => {
    service.getLeaderboard.mockResolvedValue([
      { playerId: 'player_1', score: 500, rank: 1 },
    ]);

    const result = await controller.getLeaderboard('t1', 10, 0);

    expect(service.getLeaderboard).toHaveBeenCalledWith('t1', 10, 0);
    expect(result).toEqual([{ playerId: 'player_1', score: 500, rank: 1 }]);
  });
});
