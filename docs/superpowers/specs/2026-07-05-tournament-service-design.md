# RealPlay Tournament Service - Design Spec

## 1. Architecture Overview

We will build a NestJS monorepo workspace containing two applications:
1.  **`api`**: A Fastify-based HTTP server exposing endpoints for bets, tournament creation, and leaderboards.
2.  **`worker`**: A background processor (using BullMQ) responsible for finalizing tournaments when they end.

**Infrastructure Dependencies:**
*   **PostgreSQL**: Source of truth for tournaments, bet deduplication, and final results. Accessed via Prisma ORM.
*   **Redis**: Used for live leaderboard ranking (ZSETs) and BullMQ job scheduling. Accessed via `ioredis`.

## 2. Data Models (Prisma)

```prisma
model Tournament {
  id        String             @id @default(uuid())
  name      String
  startsAt  DateTime
  endsAt    DateTime
  status    TournamentStatus   @default(PENDING) // PENDING, ACTIVE, COMPLETED
  createdAt DateTime           @default(now())

  bets      TournamentBet[]
  results   TournamentResult[]
}

enum TournamentStatus {
  PENDING
  ACTIVE
  COMPLETED
}

model TournamentBet {
  id            String     @id @default(uuid())
  tournamentId  String
  externalBetId String
  playerId      String
  amount        Int        // in cents
  currency      String
  createdAt     DateTime   @default(now())

  tournament    Tournament @relation(fields: [tournamentId], references: [id])

  // Strict idempotency constraint: an external bet can only count ONCE per tournament.
  @@unique([tournamentId, externalBetId])
}

model TournamentResult {
  id           String     @id @default(uuid())
  tournamentId String
  playerId     String
  score        Int
  rank         Int
  createdAt    DateTime   @default(now())

  tournament   Tournament @relation(fields: [tournamentId], references: [id])

  @@unique([tournamentId, playerId])
}
```

## 3. Endpoints & Data Flow

### POST `/tournaments`
*   **Input**: `{ "name": "Weekend Clash", "startsAt": "2026-07-06T00:00:00Z", "endsAt": "2026-07-07T00:00:00Z" }`
*   **Action**: 
    1. Validates input.
    2. Creates `Tournament` record in Postgres.
    3. Schedules a BullMQ delayed job on the `tournament-snapshot` queue with `delay = endsAt - now`.
*   **Response**: `201 Created` with tournament details.

### POST `/bet`
*   **Input**: `{ "externalBetId": "bet_123", "playerId": "p_42", "amount": 250, "currency": "USD", "createdAt": "2026-07-06T12:00:00Z" }`
*   **Action**:
    1. Query Postgres for all tournaments where `startsAt <= bet.createdAt <= endsAt`.
    2. If no matching active tournaments are found, return `400 Bad Request` with an error message indicating the bet does not qualify for any current tournaments.
    3. For each matching tournament:
        *   Attempt to insert into `TournamentBet` `(tournamentId, externalBetId)`.
        *   **Idempotency Check**: If the insert fails with Prisma error `P2002` (Unique constraint failed), this bet was already processed. Abort the operation and return a `409 Conflict` (or `400 Bad Request`) with a clear error message to the client indicating the bet is a duplicate.
        *   If the insert succeeds, execute Redis command: `ZINCRBY tournament:{id}:leaderboard <amount> <playerId>`.
*   **Response**: `202 Accepted` on success, `400 Bad Request` if no eligible tournaments, or `409 Conflict` if duplicate.

### GET `/tournaments/:id/leaderboard?limit=10&offset=0`
*   **Input**: `tournamentId`, pagination query params.
*   **Action**:
    1. If the tournament is `ACTIVE` (or `PENDING`), query Redis `ZREVRANGE tournament:{id}:leaderboard <offset> <offset + limit - 1> WITHSCORES`.
    2. If the tournament is `COMPLETED`, query Postgres `TournamentResult` table sorted by `rank` ASC.
*   **Response**: `200 OK` with paginated `[{ playerId, score, rank }]`.

## 4. Snapshot Worker (BullMQ)

**Queue**: `tournament-snapshot`

When a job executes (triggered at a tournament's `endsAt` time):
1.  Fetch the full final leaderboard from Redis using `ZREVRANGE tournament:{id}:leaderboard 0 -1 WITHSCORES`.
2.  Iterate through the results and batch insert `TournamentResult` records into Postgres with the final `score` and computed `rank`.
3.  Update the `Tournament` status in Postgres to `COMPLETED`.
4.  *(Cleanup)* Delete the Redis key `tournament:{id}:leaderboard` to reclaim memory.

## 5. Setup & Testing Strategy
*   **Docker Compose**: Provide a `docker-compose.yml` that spins up Postgres and Redis.
*   **E2E Tests**: Use Jest with Supertest to verify bet ingestion, duplicate bet ignoring, and leaderboard ordering.