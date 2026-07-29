import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * The single Prisma client for the application.
 *
 * Per .claude/rules/10-architecture.md this is the ONLY module permitted to
 * construct a client, and only the repository layer may import it. Components,
 * services, and route handlers must not.
 *
 * Two Prisma 7 specifics are load-bearing here:
 *
 * 1. Prisma 7 removed the Rust query engine in favour of driver adapters, so
 *    `datasourceUrl` no longer exists as a constructor option. The connection
 *    is supplied through `adapter` instead.
 *
 * 2. The runtime uses DATABASE_URL — the pooled PgBouncer connection on port
 *    6543 with `?pgbouncer=true`. That is deliberately NOT the URL the CLI
 *    uses: prisma.config.ts points migrations at DIRECT_URL on 5432, because
 *    DDL and advisory locks do not survive a transaction-mode pooler.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill in the " +
      "Supabase pooled connection string (port 6543, ?pgbouncer=true).",
  );
}

function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

/**
 * Next's dev server re-evaluates modules on every hot reload. Without this
 * cache each reload would construct a fresh client and leak its connection
 * pool, and Postgres starts refusing connections after a few dozen edits.
 * Production gets a single fresh instance per process, so no cache is needed.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
