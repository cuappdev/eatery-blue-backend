import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const logLevels: Array<'query' | 'error' | 'warn' | 'info'> = [];
if (process.env.PRISMA_LOG_ERRORS !== 'false') logLevels.push('error');
if (process.env.PRISMA_LOG_WARNINGS !== 'false') logLevels.push('warn');
if (
  process.env.PRISMA_LOG_QUERIES === 'true' &&
  process.env.NODE_ENV === 'development'
) {
  logLevels.push('query');
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
  });

  return new PrismaClient({
    adapter,
    log: logLevels,
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$on('error' as never, (e: unknown) => {
  console.error('Prisma Client Error:', e);
});
