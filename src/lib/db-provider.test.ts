/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test'
import { getDatabaseProvider, PRISMA_PATHS } from './db-provider'

describe('getDatabaseProvider', () => {
  test('postgres URLs → postgresql', () => {
    expect(getDatabaseProvider('postgres://u:p@localhost:5432/canvix')).toBe('postgresql')
    expect(getDatabaseProvider('postgresql://u:p@localhost:5432/canvix?sslmode=require')).toBe('postgresql')
  })

  test('mysql URL → mysql', () => {
    expect(getDatabaseProvider('mysql://u:p@localhost:3306/canvix')).toBe('mysql')
  })

  test('missing URL → clear error', () => {
    expect(() => getDatabaseProvider(undefined)).toThrow('DATABASE_URL is required')
    expect(() => getDatabaseProvider('')).toThrow('DATABASE_URL is required')
  })

  test('unknown scheme → clear error', () => {
    expect(() => getDatabaseProvider('file:./dev.db')).toThrow('must start with')
  })

  test('each provider has its own schema and migrations folder', () => {
    expect(PRISMA_PATHS.postgresql.migrations).not.toBe(PRISMA_PATHS.mysql.migrations)
    expect(PRISMA_PATHS.mysql.schema).toBe('prisma/schema.mysql.prisma')
  })
})
