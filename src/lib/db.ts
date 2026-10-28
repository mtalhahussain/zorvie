import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Vercel's Prisma Postgres integration sets PRISMA_DATABASE_URL (pooled,
// over HTTPS). Serverless functions can't reach the direct TCP DATABASE_URL
// (db.prisma.io:5432), so prefer the pooled URL at runtime when present.
// Migrations still use DATABASE_URL via prisma.config.ts.
const pooledUrl = process.env.PRISMA_DATABASE_URL

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    ...(pooledUrl ? { datasourceUrl: pooledUrl } : {}),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
