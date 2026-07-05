## Global Constraints
- Must use NestJS CLI workspace structure.
- HTTP server must use Fastifyadapter.
- Amounts must always be treated as integers (cents).
- `externalBetId` must be strictly deduplicated per tournament. Duplicate bets must return 409 Conflict.
- Must provide a runnable `docker-compose.yml` for DBs.
- Must provide clear setup instructions in a README.

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
Write the schema according to the design spec (`Tournament`, `TournamentBet`, `TournamentResult` with necessary Enums and Unique constraints). Note: Ensure the `DATABASE_URL` in `.env` matches the `docker-compose.yml` configuration (`postgresql://postgres:postgres@localhost:5432/postgres?schema=public`).

- [ ] **Step 3: Create initial migration**
Ensure docker-compose is running. Run: `npx prisma migrate dev --name init`

- [ ] **Step 4: Create shared Prisma module**
Run: `nest generate library prisma`. 
Implement `PrismaService` handling `onModuleInit` (`await this.$connect()`).

- [ ] **Step 5: Commit**
Commit changes with message `feat: add prisma schema and shared service`