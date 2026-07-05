# RealPlay Tournament Service

## Prerequisites
- Node.js (v18+ recommended)
- Docker and Docker Compose

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Infrastructure (PostgreSQL & Redis)**
   ```bash
   docker-compose up -d
   ```

3. **Database Setup**
   *(Database migrations will be run according to future ORM setup)*

4. **Running the Apps**

   Start the main API (Fastify server):
   ```bash
   npm run start:dev api
   ```

   Start the worker process:
   ```bash
   npm run start:dev worker
   ```

## Architecture
- **API**: Handles external requests using NestJS + Fastify.
- **Worker**: Processes background jobs via BullMQ / Redis.
- **Database**: PostgreSQL 15 for persistent data storage.
- **Cache / Queues**: Redis 7.
