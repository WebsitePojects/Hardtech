# Deployment

Everything in this document is the work that remains after the codebase is
finished. It is deliberately short, because the only things left are the ones
that need credentials or a human decision.

## What is already done

- Schema, migrations and integrity constraints, with a failing-case test per
  constraint (`npm run test:db`).
- All mutations are real and duplicate-safe, with sequential and concurrent
  double-fire tests (`npm test`).
- Password hashing and verification (scrypt, `node:crypto`, no dependency).
- The production build compiles every route (`npm run build`).

## Step 1 — Create the Supabase project

1. Create a project at <https://supabase.com/dashboard>.
2. Project Settings → Database → Connection string. You need **both** URLs and
   they are not interchangeable:

   | Variable | Port | Purpose |
   |---|---|---|
   | `DATABASE_URL` | **6543** | Pooled through PgBouncer. Used by the app at runtime. **Must** end with `?pgbouncer=true`. |
   | `DIRECT_URL` | **5432** | Direct. Used only by `prisma migrate`. |

   The `?pgbouncer=true` suffix is not optional. Without it Prisma issues
   prepared statements that a transaction-mode pooler cannot hold, and queries
   fail intermittently under load rather than immediately — which is a
   miserable bug to trace. Never point migrations at the pooled URL: DDL and
   advisory locks do not survive a transaction-mode pooler.

## Step 2 — Set environment variables

Copy `.env.example` and fill it in. On the host, set the same variables in the
project's environment settings.

```
DATABASE_URL=            # pooled, 6543, ?pgbouncer=true
DIRECT_URL=              # direct, 5432
AUTH_SECRET=             # openssl rand -base64 32
AUTH_URL=                # https://your-domain
```

**`DEMO_AUTH` must not be set in production.** It gates the one function that
accepts any password for a known seeded email, reproducing the reference site's
"TEST CREDENTIALS — password: any value" box. It is already off unless
explicitly set to `true`, and `NODE_ENV=production` is checked as well. Leaving
it unset is the correct production configuration.

`AUTH_SECRET` signs session cookies. Rotating it invalidates every existing
session, which is the intended behaviour if it is ever exposed.

## Step 3 — Migrate and seed

```bash
npx prisma generate           # the client is gitignored; generate after clone
npx prisma migrate deploy     # uses DIRECT_URL
npx tsx prisma/seed.ts        # idempotent — safe to run more than once
```

The seed is idempotent by design: running it twice produces identical row
counts. It creates the demo users the reference site advertises
(`admin@gmail.com`, `trainer@gmail.com`, `trainee@gmail.com`) plus the real
programs, trainers, communities, forum content and gallery photos.

**Decide before seeding production:** the seeded demo accounts are real login
accounts. If this deployment is public, either remove them from the seed or
change their passwords immediately after seeding.

## Step 4 — Deploy

The app is a standard Next.js 16 App Router project with no custom server and
no webpack config, so any Node host works. Vercel needs no configuration file.

- Build command: `npm run build`
- Install command: `npm install`
- Node: 20.9+ (developed on 24.14.1)

`next build` does **not** lint in Next 16 — `next lint` was removed. CI must run
`npm run lint` as its own step or lint failures ship silently. `npm run verify`
runs typecheck, lint, tests and build together.

## Step 5 — Domain

Point the domain at the host, then set `AUTH_URL` to the final `https://` origin
and redeploy. Session cookies are `httpOnly` and set `secure` outside
development, so the site must be served over HTTPS for login to work.

## Known gaps that need a human decision

These are not bugs. They are places where the reference design or the product
does not yet specify an answer, and inventing one would be worse than leaving
the gap visible.

- **No email provider is configured.** Password reset creates and consumes
  tokens correctly, but the send step is a `TODO(deploy)` at a single named
  point. Wire a provider (Resend, SES, Postmark) there.
- **File uploads are not backed by storage.** Enrollment proof-of-payment and
  assignment submissions record metadata; a bucket (Supabase Storage) needs
  connecting before real files can be accepted.
- **`reputationBadge` is deliberately unimplemented.** There is no reputation
  model in the schema and no formula anywhere in the 272 reference screenshots.
- **Some `/help` copy is authored, not transcribed.** The Filipino translation
  is machine-written; the reference screenshots recorded that a translation
  exists without capturing its text.
- **CCTV Installation and Networking Basics** have no marketing card in any
  reference screenshot. Their placeholders are marked `NOT SOURCED` inline.

## Operational notes

- `generated/prisma` is gitignored. Always `npx prisma generate` after a clone
  or a fresh CI checkout, or the build fails on a missing client.
- Local development uses a plain PostgreSQL 17 service, not `prisma dev`. The
  throwaway `prisma dev` server repeatedly died while its proxy kept the port
  bound, producing `Server has closed the connection` on random routes. See
  `.claude/lessons.md`.
