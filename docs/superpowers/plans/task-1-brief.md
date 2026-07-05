## Global Constraints
- Must use NestJS CLI workspace structure.
- HTTP server must use Fastifyadapter.
- Amounts must always be treated as integers (cents).
- `externalBetId` must be strictly deduplicated per tournament. Duplicate bets must return 409 Conflict.
- Must provide a runnable `docker-compose.yml` for DBs.
- Must provide clear setup instructions in a README.

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
Modify `apps/api/src/main.ts` to use `FastifyAdapter` instead of Express. Also remember to install fastify packages if needed (like `fastify`).

- [ ] **Step 5: Write `README.md`**
Write clear setup and run instructions (starting docker, running migrations, starting apps).

- [ ] **Step 6: Commit**
Commit changes with message `build: scaffold monorepo and docker infra`