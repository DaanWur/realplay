import { Test, TestingModule } from '@nestjs/testing';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';

describe('BetsController', () => {
  let controller: BetsController;
  let service: { ingest: jest.Mock };

  beforeEach(async () => {
    service = { ingest: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BetsController],
      providers: [{ provide: BetsService, useValue: service }],
    }).compile();

    controller = module.get<BetsController>(BetsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('delegates bet ingestion to BetsService', async () => {
    const dto = {
      externalBetId: 'bet_123456',
      playerId: 'player_42',
      amount: 250,
      currency: 'USD',
      createdAt: '2026-06-04T12:30:00.000Z',
    };
    service.ingest.mockResolvedValue({
      status: 'ok',
      processedCount: 1,
      duplicateCount: 0,
    });

    const result = await controller.ingest(dto);

    expect(service.ingest).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      status: 'ok',
      processedCount: 1,
      duplicateCount: 0,
    });
  });
});
