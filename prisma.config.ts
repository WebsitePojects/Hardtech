import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 moved connection configuration out of schema.prisma into this file.
 * The datasource block in prisma/schema.prisma carries only `provider`.
 * See .claude/rules/40-prisma-7.md.
 *
 * IMPORTANT — this config drives the Prisma CLI (migrate, db push, studio),
 * NOT the application runtime.
 *
 * Supabase exposes two connection strings and they are not interchangeable:
 *
 *   DIRECT_URL    direct connection, port 5432
 *   DATABASE_URL  pooled via PgBouncer, port 6543, `?pgbouncer=true`
 *
 * Migrations need DDL and advisory locks, neither of which survives a
 * transaction-mode pooler, so the CLI must use DIRECT_URL. The app runtime
 * wants the pooled connection instead and gets it from the PrismaClient
 * constructor in src/server/db.ts.
 *
 * `@prisma/config` 7.9.1 types `Datasource` as `{ url?, shadowDatabaseUrl? }` —
 * there is no `directUrl` key here, despite what some v7 migration docs claim.
 * Hence pointing `url` straight at DIRECT_URL rather than declaring both.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
