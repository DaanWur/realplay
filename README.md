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
   npm run start:dev:worker   # Worker (no HTTP surface — consumes the snapshot queue)
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

## Assumptions

Places where the spec was ambiguous and a call had to be made:

- **A bet is checked against all currently open tournaments,** including ones in `PENDING`
  status (only `COMPLETED` tournaments are excluded). The schema has an `ACTIVE` status but
  nothing currently transitions a tournament into it — there's no business rule in the spec
  for when "pending" becomes "active," so eligibility is decided purely by the
  `startsAt <= createdAt <= endsAt` window rather than by status.
- **Duplicate bets are a silent success, not an error.** The spec says a duplicate
  `externalBetId` should be "counted only once" and return an idempotent response, so
  `POST /bet` always returns `202` with a `duplicateCount` rather than `409 Conflict` —
  the caller doesn't need to treat a duplicate as a failure to handle.

## Decisions

Deliberate design choices, and why:

- **Idempotency via Postgres, not Redis.** Deduplication relies on a
  `@@unique([tournamentId, externalBetId])` constraint; the Redis `ZINCRBY` only runs after
  the Postgres insert succeeds. This makes Postgres the single source of truth for "has
  this bet been counted." An alternative (e.g. a Redis `SETNX`-based dedupe check) would be
  faster but introduces a second source of truth that could drift from Postgres.
- **Bets are applied to matching tournaments concurrently**, not one at a time, since a
  single bet can count toward multiple overlapping tournaments — otherwise latency would
  scale linearly with however many tournaments happen to overlap.
- **Prisma 7 requires a driver adapter** (`@prisma/adapter-pg`) rather than a bare
  connection string — a change from earlier Prisma versions where `PrismaClient`
  constructor accepted a `url` directly.
- **The worker has no HTTP surface.** It only consumes the `tournament-snapshot` BullMQ
  queue, so it boots via `NestFactory.createApplicationContext()` instead of a listening
  HTTP server.

## Tradeoffs

What each decision gave up in exchange for what it gained:

- **Consistency over ingestion throughput.** Writing to Postgres before Redis on every bet
  means ingestion is bounded by Postgres write latency rather than Redis's. Chosen because
  correctness of the final score matters more here than raw throughput.
- **Per-tournament parallelism over cross-tournament atomicity.** A bet spanning several
  tournaments is applied to all of them concurrently for lower latency, but there's no
  rollback across them: if one tournament's write succeeds and another's throws, the
  first keeps its recorded score even though the overall request surfaces as an error.
- **No retry policy on the snapshot job.** BullMQ's default `attempts: 1` is left as-is —
  simpler to reason about, but if the worker crashes mid-snapshot, that tournament won't
  automatically retry; it needs manual re-triggering.
- **Headless worker over a "free" health endpoint.** Dropping the worker's unused HTTP
  server also drops the liveness/readiness route that server would have given for free —
  there's currently no way to health-check the worker beyond its logs or the queue's job
  counts.
- **`whitelist: true` strips silently instead of rejecting.** Unexpected fields in a
  request body are dropped before reaching the service layer rather than causing a `400`
  (that would additionally need `forbidNonWhitelisted: true`). Safer against accidental
  data leakage into the DB layer, at the cost of never telling the caller a field was
  ignored.

## Known Gaps

Things that are not handled, on purpose, given the scope of this exercise:

- **No distributed transaction between Postgres and Redis.** If the process crashes between
  the Postgres insert and the `ZINCRBY` call, the bet is durably recorded but the live
  leaderboard undercounts it until the tournament ends and the worker rebuilds truth from
  wherever Redis is at that moment. Since the tournament's final results always come from
  Postgres (via the snapshot job re-reading the leaderboard key), this only risks a
  temporarily-stale *live* leaderboard, never the final one.
- **Snapshot job runs once, at `endsAt`, with no reconciliation window.**
  `TournamentResult` inserts use `skipDuplicates: true` so a retried/duplicate job
  execution is harmless, but there's no handling for bets that land in Postgres after the
  snapshot has already run (the spec doesn't ask for a grace period, so none is
  implemented).
- **The snapshot worker trusts the queue, not the clock.** `process()` doesn't re-check
  `endsAt` before finalizing — it relies entirely on the job having been scheduled with
  `delay = endsAt - now` at creation time (the only place a snapshot job is ever enqueued,
  with no retry policy configured). This holds for every path the application code can
  take; it would only break if a job were pushed onto the `tournament-snapshot` queue
  out-of-band (e.g. manually via a queue dashboard), which nothing in this codebase does.
