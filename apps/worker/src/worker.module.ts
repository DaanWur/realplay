import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { WorkerController } from './worker.controller';
import { WorkerService } from './worker.service';
import { RedisModule } from '@app/redis';
import { PrismaModule } from '@app/prisma';

import { SnapshotProcessor } from './snapshot/snapshot.processor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    PrismaModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        },
      }),
    }),
  ],
  controllers: [WorkerController],
  providers: [WorkerService, SnapshotProcessor],
})
export class WorkerModule {}
