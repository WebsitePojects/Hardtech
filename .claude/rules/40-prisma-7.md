# Prisma 7 — what changed since your training data

This project runs **Prisma 7.9.1**. The schema contract and client import path
both changed from Prisma 5/6. Writing v6 syntax fails `prisma validate`.

Prisma ships its own agent skill references. If you run `npx prisma init` in a
scratch directory it writes them to `.claude/skills/prisma-*/references/`.
The relevant ones are `prisma-upgrade-v7/references/schema-changes.md` and
`prisma-config.md`. Read them before changing schema structure.

## 1. Generator block

```prisma
generator client {
  provider = "prisma-client"     // NOT "prisma-client-js"
  output   = "../generated/prisma"  // MANDATORY in v7
}
```

The client no longer generates into `node_modules`. `output` is required.
`generated/prisma` is gitignored — run `npx prisma generate` after clone.

## 2. Datasource block takes only `provider`

```prisma
// v6 — WRONG here
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// v7 — RIGHT
datasource db {
  provider = "postgresql"
}
```

`url`, `directUrl`, and `shadowDatabaseUrl` moved to `prisma.config.ts` at the
repo root. That file is already written — do not duplicate connection config
into the schema.

**There is no `directUrl` key in `prisma.config.ts`.** Some v7 migration docs
show one; the shipped types in `@prisma/config@7.9.1` do not have it:

```ts
export declare type Datasource = {
    url?: string;
    shadowDatabaseUrl?: string;
};
```

Adding it fails typecheck with TS2353. Verified against
`node_modules/@prisma/config/dist/index.d.ts`. When a bundled doc and the
installed type definitions disagree, the type definitions win.

## 3. Import path

```ts
// WRONG
import { PrismaClient } from '@prisma/client'

// RIGHT — resolves to the generated output directory
import { PrismaClient } from '@/../generated/prisma/client'
```

Generated entrypoints: `client` (server client + Prisma namespace), `browser`
(browser-safe types and enums, no real client), `enums` (enum-only), `models`
(model types and helpers). Import enums into client components from `enums` or
`browser`, never from `client` — pulling `client` into a browser bundle drags
the server runtime with it.

## 4. `Prisma.validator()` is gone

Use TypeScript `satisfies` instead:

```ts
import { Prisma } from '@/../generated/prisma/client'

const postListSelect = {
  id: true,
  title: true,
} satisfies Prisma.ForumPostSelect
```

## 5. Supabase connection rules

`DATABASE_URL` is the pooled PgBouncer connection on port **6543** and must end
with `?pgbouncer=true` — without it Prisma issues prepared statements that
transaction-mode PgBouncer cannot hold, and queries fail intermittently under
load rather than immediately, which makes it a nasty bug to trace.

`DIRECT_URL` is the direct connection on port **5432** and is used only by
`prisma migrate`, which needs DDL and advisory locks that do not survive a
transaction-mode pooler.

Never point migrations at the pooled URL.

## 6. Client instantiation in Next.js

Next's dev server hot-reloads modules, so a naive `new PrismaClient()` at module
scope leaks a new connection pool on every reload until Postgres refuses
connections. Cache it on `globalThis` in development. This belongs in exactly
one file in `src/server/` and nothing else may construct a client.
