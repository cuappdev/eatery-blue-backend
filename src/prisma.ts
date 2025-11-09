import { PrismaClient } from '@prisma/client';

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

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: logLevels,
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

prisma.$on('error' as never, (e: unknown) => {
  console.error('Prisma Client Error:', e);
});
