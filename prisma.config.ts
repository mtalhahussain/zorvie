// Prisma CLI config. DATABASE_URL alone picks the provider:
//   postgres:// | postgresql://  → prisma/schema.prisma       + prisma/migrations
//   mysql://                     → prisma/schema.mysql.prisma + prisma/migrations-mysql
// The generated client is provider-specific: re-run `prisma generate` after
// switching DATABASE_URL to another database type.
import 'dotenv/config' // a prisma.config.ts disables Prisma's own .env loading
import { defineConfig } from 'prisma/config'
import { getDatabaseProvider, PRISMA_PATHS } from './src/lib/db-provider'

const paths = PRISMA_PATHS[getDatabaseProvider(process.env.DATABASE_URL)]

export default defineConfig({
  schema: paths.schema,
  migrations: {
    path: paths.migrations,
    seed: 'bun prisma/seed.ts',
  },
})
