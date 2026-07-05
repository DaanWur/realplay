import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'tournament-snapshot',
    }),
  ],
  providers: [TournamentsService],
  controllers: [TournamentsController]
})
export class TournamentsModule {}
