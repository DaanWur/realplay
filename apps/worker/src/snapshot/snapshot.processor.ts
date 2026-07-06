import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@app/prisma';
import { RedisService } from '@app/redis';
import { Logger } from '@nestjs/common';

interface ResultsData {
  tournamentId: string;
  playerId: string;
  score: number;
  rank: number;
}

@Processor('tournament-snapshot')
export class SnapshotProcessor extends WorkerHost {
  private readonly logger = new Logger(SnapshotProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<{ tournamentId: string }>): Promise<void> {
    const { tournamentId } = job.data;
    this.logger.log(`Starting snapshot for tournament ${tournamentId}`);

    // Fetch full leaderboard from Redis
    const key = `tournament:${tournamentId}:leaderboard`;
    const redisResults = await this.redis.zrevrange(key, 0, -1, 'WITHSCORES');

    if (redisResults.length > 0) {
      // Map into results
      const resultsData: ResultsData[] = this.mapRedisResults(
        redisResults,
        tournamentId,
      );

      // Batch insert inside a transaction
      await this.batchInsertTransactions(resultsData, tournamentId);
    } else {
      // No bets placed, just update status
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED' },
      });
    }

    // Cleanup redis key
    await this.redis.del(key);

    this.logger.log(`Finished snapshot for tournament ${tournamentId}`);
  }

  private async batchInsertTransactions(
    resultsData: ResultsData[],
    tournamentId: string,
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.tournamentResult.createMany({
        data: resultsData,
        skipDuplicates: true, // Just in case this job runs twice
      });

      // Update status
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { status: 'COMPLETED' },
      });
    });
  }

  private mapRedisResults(
    redisResults: string[],
    tournamentId: string,
  ): ResultsData[] {
    const resultsData: ResultsData[] = [];

    for (let i = 0; i < redisResults.length; i += 2) {
      resultsData.push({
        tournamentId,
        playerId: redisResults[i],
        score: parseInt(redisResults[i + 1], 10),
        rank: Math.floor(i / 2) + 1,
      });
    }
    return resultsData;
  }
}
