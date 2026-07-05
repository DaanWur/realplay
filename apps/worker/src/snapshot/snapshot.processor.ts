import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { Logger } from '@nestjs/common';

@Processor('tournament-snapshot')
export class SnapshotProcessor extends WorkerHost {
  private readonly logger = new Logger(SnapshotProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<{ tournamentId: string }>) {
    const { tournamentId } = job.data;
    this.logger.log(`Starting snapshot for tournament ${tournamentId}`);

    // 1. Fetch full leaderboard
    const key = `tournament:${tournamentId}:leaderboard`;
    const redisResults = await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');

    if (redisResults.length > 0) {
      // 2. Map into results
      const resultsData: { tournamentId: string; playerId: string; score: number; rank: number }[] = [];
      for (let i = 0; i < redisResults.length; i += 2) {
        resultsData.push({
          tournamentId,
          playerId: redisResults[i],
          score: parseInt(redisResults[i + 1], 10),
          rank: Math.floor(i / 2) + 1,
        });
      }

      // Batch insert inside a transaction
      await this.prisma.$transaction(async (tx) => {
        await tx.tournamentResult.createMany({
          data: resultsData,
          skipDuplicates: true, // Just in case this job runs twice
        });

        // 3. Update status
        await tx.tournament.update({
          where: { id: tournamentId },
          data: { status: 'COMPLETED' },
        });
      });
    } else {
      // No bets placed, just update status
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED' },
      });
    }

    // 4. Cleanup redis key
    await this.redis.del(key);
    
    this.logger.log(`Finished snapshot for tournament ${tournamentId}`);
  }
}
