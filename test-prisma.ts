import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({ url: process.env.DATABASE_URL });
  await prisma.$connect();
  console.log("Connected successfully");
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
