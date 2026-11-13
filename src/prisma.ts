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

// CA certificate for the managed Postgres cluster (DigitalOcean signs its
// database certificates with its own CA, which Node doesn't trust by default).
// Stored on one line in .env with literal "\n" in place of line breaks.
// Unset locally, where the dev database doesn't use SSL.
const databaseCaCert = process.env.DATABASE_CA_CERT?.replace(/\\n/g, '\n');

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    // Note: an `sslmode` param in DATABASE_URL overrides this, so remove it
    // from the URL when DATABASE_CA_CERT is set.
    ...(databaseCaCert && { ssl: { ca: databaseCaCert } }),
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
