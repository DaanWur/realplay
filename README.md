# RealPlay Tournament Service

A small NestJS monorepo that creates tournaments, ingests bet events, exposes a live
leaderboard, and writes final placements once a tournament ends.

- **`api`**: Fastify-based HTTP server exposing `POST /bet`, `POST /tournaments`, and
  `GET /tournaments/:id/leaderboard`.
- **`worker`**: BullMQ consumer that snapshots the final leaderboard to Postgres when a
  tournament's `endsAt` passes.
- **Postgres** (via Prisma): source of truth for tournaments, bet de-duplication, and final results.
- **Redis**: live leaderboard (sorted set) and BullMQ job scheduling.

## Prerequisites
- Node.js (v18+ recommended)
- Docker and Docker Compose

## Setup Instructions

1. **Start infrastructure (Postgres & Redis)**
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This also runs `prisma generate` via a `postinstall` hook.

3. **Apply database migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Run the apps** (in separate terminals)
   ```bash
   npm run start:dev          # API on http://localhost:3000
   npx nest start worker --watch   # Worker on http://localhost:3001
   ```

5. **Run tests**
   ```bash
   npm test
   ```

## API

### `POST /tournaments`
```json
{ "name": "Weekend Clash", "startsAt": "2026-07-06T00:00:00Z", "endsAt": "2026-07-07T00:00:00Z" }
```
Creates a tournament and schedules a delayed BullMQ job (`delay = endsAt - now`) that
snapshots the tournament to `COMPLETED` when it fires.

### `POST /bet`
```json
{
  "externalBetId": "bet_123456",
  "playerId": "player_42",
  "amount": 250,
  "currency": "USD",
  "createdAt": "2026-06-04T12:30:00.000Z"
}
```
`amount` is in cents. The bet is applied to every tournament where
`startsAt <= createdAt <= endsAt`. Returns `202 Accepted` with
`{ status: "ok", processedCount, duplicateCount }`. A bet already recorded for a given
tournament (same `externalBetId`) is idempotent: it does not increase the score again and
still returns `202`, per the spec. Returns `400 Bad Request` if the bet doesn't fall
within any tournament's window.

### `GET /tournaments/:id/leaderboard?limit=10&offset=0`
Returns `[{ playerId, score, rank }]` sorted by score descending. Reads from Redis while
the tournament is live, and from the Postgres `TournamentResult` table once it's
`COMPLETED`.

## Assumptions & Tradeoffs

- **Idempotency via Postgres, not Redis.** Deduplication relies on a
  `@@unique([tournamentId, externalBetId])` constraint; the Redis `ZINCRBY` only runs after
  the Postgres insert succeeds. This makes Postgres the single source of truth for "has
  this bet been counted," at the cost of a write to Postgres per bet even for high-throughput
  ingestion. An alternative (e.g. a Redis `SETNX`-based dedupe check) would be faster but
  introduces a second source of truth that could drift from Postgres.
- **No distributed transaction between Postgres and Redis.** If the process crashes between
  the Postgres insert and the `ZINCRBY` call, the bet is durably recorded but the live
  leaderboard undercounts it until the tournament ends and the worker rebuilds truth from
  wherever Redis is at that moment. Given the tournament's final results always come from
  Postgres (via the snapshot job re-reading the leaderboard key), this only risks a
  temporarily-stale *live* leaderboard, not the final one — an acceptable tradeoff for
  the added complexity a saga/outbox pattern would require.
- **A bet is checked against all currently open tournaments,** including ones in `PENDING`
  status (only `COMPLETED` tournaments are excluded). The schema has an `ACTIVE` status but
  nothing currently transitions a tournament into it — there's no business rule in the spec
  for when "pending" becomes "active," so eligibility is decided purely by the
  `startsAt <= createdAt <= endsAt` window rather than by status.
- **Snapshot job runs once, at `endsAt`.** `TournamentResult` inserts use `skipDuplicates:
  true` so a retried/duplicate job execution is harmless, but there's no reconciliation if
  bets somehow land in Postgres after the snapshot has already run (the spec doesn't ask for
  a grace period, so none is implemented).
- **Prisma 7 requires a driver adapter** (`@prisma/adapter-pg`) rather than a bare
  connection string — a change from earlier Prisma versions where `PrismaClient`
  constructor accepted a `url` directly.
