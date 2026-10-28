// Picks the database provider from DATABASE_URL — the only switch between
// PostgreSQL and MySQL. Used by prisma.config.ts (schema + migrations folder)
// and safe to import anywhere (no Prisma / Node-only imports).

export type DatabaseProvider = 'postgresql' | 'mysql'

export const PRISMA_PATHS: Record<DatabaseProvider, { schema: string; migrations: string }> = {
  postgresql: { schema: 'prisma/schema.prisma', migrations: 'prisma/migrations' },
  mysql: { schema: 'prisma/schema.mysql.prisma', migrations: 'prisma/migrations-mysql' },
}

export function getDatabaseProvider(databaseUrl: string | undefined): DatabaseProvider {
  if (!databaseUrl) throw new Error('DATABASE_URL is required (postgresql://… or mysql://…)')
  if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) return 'postgresql'
  if (databaseUrl.startsWith('mysql://')) return 'mysql'
  throw new Error('DATABASE_URL must start with postgres://, postgresql:// or mysql://')
}
