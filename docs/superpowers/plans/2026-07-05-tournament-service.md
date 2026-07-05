# Tournament Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable NestJS monorepo (API and Worker) that manages tournaments, ingests bets idempotently using Postgres, maintains live leaderboards in Redis, and snapshots final results via BullMQ.

**Architecture:** 
A NestJS monorepo workspace containing an `api` app and a `worker` app. 
Postgres acts as the source of truth for tournament configuration, bet deduplication (via composite unique constraints), and final snapshotted results.
Redis is used for high-performance live leaderboard tracking (ZSETs) and scheduling snapshot jobs (BullMQ).

**Tech Stack:** NestJS, Fastify, Prisma, PostgreSQL, Redis (ioredis), BullMQ, Docker Compose.

## Global Constraints

- Must use NestJS CLI workspace structure.
- HTTP server must use Fastifyadapter.
- Amounts must always be treated as integers (cents).
- `externalBetId` must be strictly deduplicated per tournament. Duplicate bets must return 409 Conflict.
- Must provide a runnable `docker-compose.yml` for DBs.
- Must provide clear setup instructions in a README.

---

### Task 1: Scaffolding and Infrastructure Setup

**Files:**
- Create: `docker-compose.yml`
- Create: `README.md`
- Create: `nest-cli.json`
- Create: `package.json`

**Interfaces:**
- Consumes: N/A
- Produces: Running Postgres on port 5432, running Redis on port 6379, standard NestJS monorepo structure.

- [ ] **Step 1: Create `docker-compose.yml`**
Write a `docker-compose.yml` with `postgres:15` (port 5432) and `redis:7` (port 6379) services.

- [ ] **Step 2: Initialize NestJS Monorepo structure**
Initialize the workspace structure. Generate an `api` app (default) and a `worker` app.
Run: `npm install -g @nestjs/cli && nest new realplay-api -p npm --skip-git --packageManager npm && cd realplay-api && nest generate app worker`. Note: do this by moving the created files back to the root directory to keep the workspace flat.

- [ ] **Step 3: Update `package.json` dependencies**
Install required dependencies: `npm install @nestjs/platform-fastify @nestjs/config ioredis bullmq @nestjs/bullmq`

- [ ] **Step 4: Update `main.ts` for Fastify**
Modify `apps/api/src/main.ts` to use `FastifyAdapter` instead of Express.

- [ ] **Step 5: Write `README.md`**
Write clear setup and run instructions (starting docker, running migrations, starting apps).

- [ ] **Step 6: Commit**
Commit changes with message `build: scaffold monorepo and docker infra`

---

### Task 2: Prisma Schema and Database Setup

**Files:**
- Create: `prisma/schema.prisma`
- Create: `libs/prisma/src/prisma.service.ts`
- Create: `libs/prisma/src/prisma.module.ts`

**Interfaces:**
- Consumes: Postgres connection string
- Produces: Prisma Client and injectable `PrismaService`

- [ ] **Step 1: Initialize Prisma**
Run: `npx prisma init`

- [ ] **Step 2: Define Prisma Schema**
Write the schema according to the design spec (`Tournament`, `TournamentBet`, `TournamentResult` with necessary Enums and Unique constraints).

- [ ] **Step 3: Create initial migration**
Ensure docker-compose is running. Run: `npx prisma migrate dev --name init`

- [ ] **Step 4: Create shared Prisma module**
Run: `nest generate library prisma`. 
Implement `PrismaService` handling `onModuleInit`.

- [ ] **Step 5: Commit**
Commit changes with message `feat: add prisma schema and shared service`

---

### Task 3: Shared Redis and BullMQ Modules

**Files:**
- Create: `libs/redis/src/redis.service.ts`
- Create: `libs/redis/src/redis.module.ts`
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/worker/src/worker.module.ts`

**Interfaces:**
- Consumes: Redis connection config.
- Produces: Injectable `RedisService` providing access to `ioredis` instance. Registered BullMQ queue `tournament-snapshot`.

- [ ] **Step 1: Create shared Redis module**
Run: `nest generate library redis`.
Implement `RedisService` creating an `ioredis` connection instance.

- [ ] **Step 2: Configure BullMQ in API and Worker**
Import `BullModule.forRoot` in both app modules pointing to the Redis instance.
Import `BullModule.registerQueue({ name: 'tournament-snapshot' })` in the API app module.

- [ ] **Step 3: Commit**
Commit changes with message `feat: configure redis and bullmq`

---

### Task 4: API - Tournament Management

**Files:**
- Create: `apps/api/src/tournaments/tournaments.controller.ts`
- Create: `apps/api/src/tournaments/tournaments.service.ts`
- Create: `apps/api/src/tournaments/dto/create-tournament.dto.ts`

**Interfaces:**
- Consumes: `PrismaService`, BullMQ Queue injection.
- Produces: `POST /tournaments` returning `{ id: string }`.

- [ ] **Step 1: Write Create Tournament DTO**
Define `CreateTournamentDto` with `name`, `startsAt`, `endsAt`.

- [ ] **Step 2: Implement `TournamentsService.create`**
Write logic to insert `Tournament` via Prisma.
Calculate delay (`endsAt.getTime() - Date.now()`).
Add job to `tournament-snapshot` queue with the calculated delay and `tournamentId` in the payload.

- [ ] **Step 3: Implement `TournamentsController`**
Create the `POST /tournaments` route.

- [ ] **Step 4: Write integration test**
Write a test simulating tournament creation and verifying job scheduling.

- [ ] **Step 5: Commit**
Commit changes with message `feat(api): implement tournament creation`

---

### Task 5: API - Bet Ingestion

**Files:**
- Create: `apps/api/src/bets/bets.controller.ts`
- Create: `apps/api/src/bets/bets.service.ts`
- Create: `apps/api/src/bets/dto/create-bet.dto.ts`

**Interfaces:**
- Consumes: `PrismaService`, `RedisService`.
- Produces: `POST /bet` returning `202 Accepted` or `409 Conflict`.

- [ ] **Step 1: Write Create Bet DTO**
Define `CreateBetDto`.

- [ ] **Step 2: Implement `BetsService.ingest`**
Find active tournaments based on `createdAt`.
If none, throw `BadRequestException`.
Iterate matching tournaments:
- Try `prisma.tournamentBet.create()`.
- If `PrismaClientKnownRequestError` P2002, throw `ConflictException('Duplicate bet for tournament')`.
- If success, execute `redis.zincrby('tournament:{id}:leaderboard', amount, playerId)`.

- [ ] **Step 3: Implement `BetsController`**
Create `POST /bet` route.

- [ ] **Step 4: Write test for Duplicate Handling**
Write a test sending the same bet twice and asserting `409 Conflict` on the second call.

- [ ] **Step 5: Commit**
Commit changes with message `feat(api): implement bet ingestion and idempotency`

---

### Task 6: API - Live Leaderboard

**Files:**
- Modify: `apps/api/src/tournaments/tournaments.controller.ts`
- Modify: `apps/api/src/tournaments/tournaments.service.ts`

**Interfaces:**
- Consumes: `RedisService`, `PrismaService`.
- Produces: `GET /tournaments/:id/leaderboard` returning paginated placements.

- [ ] **Step 1: Implement `TournamentsService.getLeaderboard`**
Check tournament status via Prisma.
If `COMPLETED`, query `TournamentResult` from Postgres, order by `rank` ASC, apply limit/offset.
If not completed, use `redis.zrevrange(key, offset, offset + limit - 1, 'WITHSCORES')` and map to response shape.

- [ ] **Step 2: Implement Controller Route**
Create `GET /tournaments/:id/leaderboard` accepting `limit` and `offset` queries.

- [ ] **Step 3: Write test for leaderboard ordering**
Write a test ingesting multiple bets for different players and verifying correct desc ordering.

- [ ] **Step 4: Commit**
Commit changes with message `feat(api): implement live leaderboard endpoint`

---

### Task 7: Worker - Snapshot Processor

**Files:**
- Create: `apps/worker/src/snapshot/snapshot.processor.ts`

**Interfaces:**
- Consumes: BullMQ Job `tournament-snapshot`, `RedisService`, `PrismaService`.
- Produces: Completed `TournamentResult` records, `COMPLETED` tournament status.

- [ ] **Step 1: Create BullMQ Processor**
Implement `@Processor('tournament-snapshot')` extending `WorkerHost`.

- [ ] **Step 2: Implement process logic**
Extract `tournamentId` from job data.
Fetch full leaderboard: `redis.zrevrange('tournament:{id}:leaderboard', 0, -1, 'WITHSCORES')`.
Iterate and batch insert into `TournamentResult` mapping the rank (index + 1) and score.
Update `Tournament` status to `COMPLETED`.
Call `redis.del('tournament:{id}:leaderboard')`.

- [ ] **Step 3: Write worker test**
Write a test that enqueues a mock snapshot job, invokes the processor, and verifies Postgres records are created.

- [ ] **Step 4: Commit**
Commit changes with message `feat(worker): implement tournament snapshot processor`