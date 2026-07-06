import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

// The worker has no HTTP surface — it only consumes the tournament-snapshot
// BullMQ queue, so an application context (no listening port) is enough.
async function bootstrap() {
  await NestFactory.createApplicationContext(WorkerModule);
}
void bootstrap();
