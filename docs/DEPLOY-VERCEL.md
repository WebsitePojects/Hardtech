# Deploying HardTech — Vercel + Supabase + Hostinger domain

Step-by-step. Follow in order. Every value you need to paste is marked **FILL**.

Repository: `https://github.com/WebsitePojects/Hardtech`
Supabase project ref: `zoydykcqjwsprwynxcjs` (region `ap-northeast-1`, PostgreSQL 17.6)

---

## 0 — Which Supabase "Connect" tab to use

The Connect dialog offers five tabs. You need **exactly one**.

| Tab | Use it? | Why |
|---|---|---|
| **ORM → Prisma** | ✅ **YES** | Gives both connection strings in the exact shape Prisma needs. |
| Framework → Next.js | ❌ No | Installs `@supabase/supabase-js`. This app does not use it — it talks to Postgres through Prisma. Adding it would install a second, unused data layer. |
| Direct → Direct connection | ❌ No | Gives `db.zoydykcqjwsprwynxcjs.supabase.co`, which is **IPv6-only**. Vercel's build and function network, and most home ISPs, cannot reach it without the paid IPv4 add-on. |
| Server / Build APIs | ❌ No | For PostgREST clients. Not used here. |
| MCP | ➖ Optional | Only connects an AI agent to the project. Nothing to do with deployment. |

So: **ORM tab → Prisma radio button.** Copy both lines it shows you.

Both strings it gives are `...pooler.supabase.com`, which resolves on IPv4. That
is deliberate and is why this tab is the right one.

### What the two URLs are for

They are **not interchangeable**.

| Variable | Port | Used by |
|---|---|---|
| `DATABASE_URL` | **6543** transaction pooler | The running app, every request |
| `DIRECT_URL` | **5432** session pooler | `prisma migrate` only |

`DATABASE_URL` must end with **`?pgbouncer=true`**. Without it Prisma issues
prepared statements that a transaction-mode pooler cannot hold. It does not fail
immediately — it fails intermittently under load, which is a miserable bug to
trace later. Add it if Supabase's copy button omits it.

Migrations need DDL and advisory locks, neither of which survives a
transaction-mode pooler. That is why they get their own URL.

---

## 1 — Get your database password

Supabase → **Project Settings → Database**.

If you don't know the password, click **Reset database password** and save the
new one. Substitute it for `[YOUR-PASSWORD]` in both strings.

If the password contains `@ : / ? # [ ] &`, **percent-encode it** or the URL will
parse wrong. `@` → `%40`, `#` → `%23`, `/` → `%2F`.

---

## 2 — Generate the auth secret

```bash
openssl rand -base64 32
```

This signs session cookies. Changing it later logs every user out at once.
Run it **again, separately** for §4 — Vercel's `AUTH_SECRET` must not be the
same value as the one in your local `.env`. Anyone who has ever seen your
local file could otherwise forge a production session cookie.

---

## 3 — Create the schema (from your machine, once)

Vercel does **not** run migrations, and should not — parallel deploys would race
on schema changes.

```bash
git clone https://github.com/WebsitePojects/Hardtech
cd Hardtech
npm install          # postinstall runs `prisma generate`
```

Create `.env` in the repo root:

```ini
DATABASE_URL="postgresql://postgres.zoydykcqjwsprwynxcjs:FILL-PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.zoydykcqjwsprwynxcjs:FILL-PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
AUTH_SECRET="FILL-FROM-STEP-2"
```

Then:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

The seed is idempotent — re-running it will not duplicate rows.

Every Prisma CLI command needs **both** vars present even when it doesn't
connect, because `prisma.config.ts` resolves `env()` eagerly at load. A missing
var looks like a broken CLI rather than a missing `.env`.

---

## 4 — Import into Vercel

**Add New → Project → Import** `WebsitePojects/Hardtech`.

Leave build settings alone. Next.js is auto-detected. Do not add a
`vercel.json`.

| Setting | Value |
|---|---|
| Framework preset | Next.js (auto) |
| Build command | `npm run build` (default) |
| Install command | `npm install` (default) |
| Root directory | `./` |
| Node version | 20.x or later |

### Environment variables

Add these **before the first deploy** — a missing `DATABASE_URL` fails the
build, not just runtime (see Troubleshooting, Failure 1). Set each for
**Production, Preview and Development**.

| Name | Value | What breaks if it's wrong |
|---|---|---|
| `DATABASE_URL` | **FILL** — port 6543 string, ending `?pgbouncer=true` | Missing: build fails (Failure 1). Present but missing `?pgbouncer=true`: queries fail intermittently under load, not immediately — see §0. |
| `DIRECT_URL` | **FILL** — port 5432 string | `prisma migrate deploy` cannot run. The running app never reads this one. |
| `AUTH_SECRET` | **FILL** — a value from step 2, generated **again**, never the one in your local `.env` | Missing: sessions can't be signed. Reused from local: production and your laptop share a forgeable secret. |
| `CLOUDINARY_CLOUD_NAME` | **FILL** — Cloudinary console → **Settings → API Keys** | **Public value** — the browser receives it inside every signed upload ticket, so there's nothing to protect. Missing or wrong: every upload path throws `StorageNotConfiguredError`, or the signed request targets a cloud that doesn't exist. |
| `CLOUDINARY_API_KEY` | **FILL** — same console page, next to Cloud Name | Also public, also shipped to the browser in the ticket. Same failure mode as `CLOUDINARY_CLOUD_NAME` if missing or wrong. |
| `CLOUDINARY_API_SECRET` | **FILL** — same console page | **A real secret.** Never sent to the client, never a `NEXT_PUBLIC_` variable. Signs every upload ticket and checks every webhook server-side. Missing: `StorageNotConfiguredError`. Wrong: signed uploads are rejected by Cloudinary, and `verifyWebhookSignature` fails closed — it returns `false` for a mismatch rather than throwing, so a confirmed upload silently never gets marked confirmed. |

That is the complete list of variables the running app reads, alongside
`NEXT_PUBLIC_SITE_URL` (its own callout, next) and `DEMO_AUTH` (callout after
that) and `NODE_ENV`. `DIRECT_URL` is the one row above the app itself never
touches — it exists only for `prisma migrate`.

**Do not set `AUTH_URL`.** It appears in `.env.example` but no code reads it.

### ⚠️ `NEXT_PUBLIC_SITE_URL` — get this right before the first certificate is issued, not before the first deploy

This is the origin baked into the QR code printed on every certificate of
completion. Left at its `.env.example` default of `localhost:3000`, every
certificate issued carries a QR code pointing at whatever machine happened to
render the page — useless to anyone who isn't sitting at that machine.

A wrong `DATABASE_URL` fails loudly, at build or at the first query. This one
fails **silently**: the build succeeds, the certificate renders, the PDF looks
correct, and the only sign anything is wrong is a QR code that goes nowhere
once the certificate has already been printed and handed to a graduate. There
is no fixing it after that point — the document is out the door.

Set it to the canonical production domain (`https://www.hardtech.pro`) as part of the
same pass where you set the other eight variables, before anyone can reach a
"generate certificate" button, not as an afterthought once uploads or auth
are confirmed working.

### Faster: Import .env instead of typing nine rows three times

Vercel → **Settings → Environment Variables** has an **Import .env** button.
It accepts a file in `KEY="value"` lines and creates every row from it in one
paste, instead of typing each of the nine by hand for Production, Preview and
Development separately.

A `.env.vercel` file formatted for exactly this exists at the repo root for
this project's real values. It is **gitignored** and must stay that way — it
holds the production `AUTH_SECRET` and `CLOUDINARY_API_SECRET`. Never commit
it, never paste its contents into a chat, a ticket, or a screen share. If you
need to hand someone the variable *names* to fill in themselves, point them at
`.env.example` instead — it has every name and none of the values.

### ⚠️ Do not set `DEMO_AUTH`

Leaving it unset is what enables real password verification.

`DEMO_AUTH="true"` in production makes every seeded account accept **any
password**. It exists to reproduce the reference site's public demo box. It
fails closed — unset, empty, or any other value rejects demo logins — so the
safe action is simply to never add the variable.

---

## 5 — Deploy

### Pre-flight checklist

Run through this before clicking Deploy. Every item here is one of the three
failures in Troubleshooting (below), caught earlier and cheaper than after a
build.

- [ ] The Supabase project exists and its **Connect → ORM → Prisma** strings
      (§0) are in hand.
- [ ] `DATABASE_URL` and `DIRECT_URL` entered in Vercel are the Supabase
      pooler strings (`...pooler.supabase.com`) — not values copied from a
      local `.env` pointed at `localhost` (Failure 2).
- [ ] `npx prisma migrate deploy` has been run **against `DIRECT_URL`**, from
      your machine, and printed a success line — not just "no error", the
      actual `All migrations have been successfully applied.` output.
- [ ] `npx tsx prisma/seed.ts` has been run and reported success. A green
      build against an empty database still returns 200 on every page that
      doesn't touch the database, and 500 on every one that does — see
      Failure 3.
- [ ] All 9 variables from `.env.example` are accounted for in Vercel, for
      **Production, Preview and Development**: the 7 that get real values
      (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`,
      `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
      and the 2 deliberately left unset (`DEMO_AUTH`, `AUTH_URL`).
- [ ] `DEMO_AUTH` is unset in Production — not `"true"`, not present at all.
- [ ] `NEXT_PUBLIC_SITE_URL` is the canonical production domain
      (`https://www.hardtech.pro`), not `localhost:3000`.
- [ ] `CLOUDINARY_API_SECRET` has been **rotated** in the Cloudinary console
      if the value currently set was ever pasted anywhere other than
      `.env.vercel` and the Vercel dashboard — a chat message, a ticket, a
      screen share.

### Deploy

Click **Deploy**. Then open the deployed URL — `hardtech-seven.vercel.app` on
the Vercel preview, or `https://www.hardtech.pro` once the domain is attached
(§6) — and check:

- home page renders
- `/programs` lists programs from the database
- `/login` accepts a seeded account
- `/dashboard` loads after login

If the build fails on a missing Prisma client, confirm `postinstall` is present
in `package.json` — `generated/prisma` is gitignored, so the client only exists
if `prisma generate` runs during install.

If the build fails elsewhere, or succeeds but pages 500, see **Troubleshooting**
at the bottom of this document — a real deploy of this app hit all three
failures covered there, in the order they're listed.

---

## 6 — Hostinger domain

### 6a. Add the domain in Vercel

Vercel → Project → **Settings → Domains → Add**.

Add both `www.hardtech.pro` and `hardtech.pro` for this deployment, make `www`
the canonical production domain, and configure the apex to redirect to it.
Vercel then shows the **exact DNS records to create**. Use the values on that screen — do not copy
them from a blog post, Vercel has changed its apex IP and stale values
silently fail.

You will get one of two shapes:

- **A record** for the apex (`@`), plus a **CNAME** for `www`
- or a pair of **nameservers**, if you choose to delegate the whole domain

### 6b. Enter them in Hostinger

Hostinger → **Domains → your domain → DNS / Nameservers**.

**Option A — keep Hostinger DNS (recommended if you use Hostinger email):**

In **DNS Zone**, add what Vercel showed:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | **FILL** — the IP Vercel displays | 3600 |
| CNAME | `www` | **FILL** — usually `cname.vercel-dns.com` | 3600 |

Delete any pre-existing `A @` or `CNAME www` records pointing at Hostinger
parking, or they will conflict.

**Option B — delegate to Vercel:**

In **Nameservers**, choose *Change nameservers → Use custom nameservers* and
enter Vercel's two. This moves **all** DNS to Vercel — if you have Hostinger
email (MX records) on this domain, it will break unless you recreate those
records in Vercel. Prefer Option A if unsure.

### 6c. Wait, then verify

Propagation is usually minutes, up to 24h. Vercel shows **Valid Configuration**
when it sees the records. TLS is issued automatically — no certificate to buy.

If `NEXT_PUBLIC_SITE_URL` was already set to this domain before the first
deploy (it should have been — see §4's checklist), nothing further to do:
attaching the domain doesn't require a redeploy. If it was still on its
`localhost:3000` default when you built, it will stay wrong until the next
build — `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at
build time, not read at request time, so updating the value in Vercel's
dashboard alone does nothing until you trigger a new deploy.

---

## Before you hand this to real users

Three things are deliberate but need a decision from you.

### The demo accounts are real logins

`admin@gmail.com`, `trainer@gmail.com` and `trainee@gmail.com` are seeded with
roles ADMIN / TRAINER / TRAINEE, and the login page displays them because the
reference design does. With `DEMO_AUTH` unset they require real passwords — but
they still exist, with the seed password in `prisma/seed.ts`.

Either remove them from the seed, or change their passwords immediately after
seeding.

### Password reset does not send email

Token creation, hashing, expiry and single-use consumption are all implemented
and tested. Only the send step is a `TODO(deploy)` at one named point. Wire
Resend, SES or Postmark there when you want it live. Nothing else is stubbed.

### Uploads: storage layer exists, nothing calls it yet

Gallery and avatar images are still seeded paths — that part hasn't changed.
What backs a *real* upload, if one happened, has.

Uploads target **Cloudinary**, not Supabase Storage. `src/server/storage/
cloudinary.ts` is the one module that holds the credentials and enforces the
account's plan limits (10 MB image/raw, 100 MB video), failing closed with
`StorageNotConfiguredError` if the three `CLOUDINARY_*` variables in §4 are
missing. `src/server/storage/signed-upload.ts` mints a short-lived signed
ticket so the browser uploads **directly** to Cloudinary — a Vercel function
caps request bodies at 4.5 MB, so a 100 MB training video could never be
routed through the server at any plan tier — and verifies Cloudinary's
webhook signature in constant time when an upload confirms. `MediaAsset` in
`prisma/schema.prisma` is both the delete-handle registry and a purge outbox:
deleting the owner row (a module, a gallery photo) flips the asset to
`PENDING` for a worker to destroy at Cloudinary, instead of losing the
`public_id` and orphaning the file forever.

None of that is reachable by a user yet. There is no route under
`src/app/api/uploads/`, no UI calls a ticket-signing endpoint, and the purge
worker that would drain `PENDING` rows doesn't exist. **This is in-progress
work, not finished** — the three `CLOUDINARY_*` variables are in §4 because
the app will fail closed the moment that wiring lands, not because uploads
work today.

---

## Redeploying later

Push to `main`. Vercel builds automatically.

If a push includes a schema change, run `npx prisma migrate deploy` from your
machine against `DIRECT_URL` **before or after** the deploy — never as part of
the Vercel build.

Lint is not part of the build. Next 16 removed `next lint`, so `next build`
compiles without linting. Run `npm run verify` locally — typecheck, lint, tests
and build in one command — before pushing.

---

## Troubleshooting

A real deploy of this app hit three distinct failures, in this order. Fixing
one does not mean the next one won't happen — each step below only becomes
visible once the step before it stops failing.

### Failure 1 — `npm install` dies in `postinstall`

```
> hardtech@0.1.0 postinstall
> prisma generate
Failed to load config file "/vercel/path0" as a TypeScript file
npm error code 1
Error: Command "npm install" exited with 1
```

**What it means:** nothing in that message mentions an environment variable,
which is what makes it confusing. `prisma.config.ts` calls `env("DIRECT_URL")`,
and Prisma resolves that call **eagerly**, the moment the config file loads —
including for `prisma generate`, which never opens a database connection. With
no environment variables set in Vercel yet, the config file itself fails to
load, and the failure surfaces as "failed to load config file" rather than
"missing environment variable." (Same eager-resolution behaviour is recorded
in `.claude/lessons.md`, 2026-07-29.)

**Fix:** set all 9 variables in Vercel (§4) **before** the first deploy. A
project with zero env vars configured will always fail here, on the very
first `npm install`.

### Failure 2 — build succeeds, every request points at `localhost`

There's no single error string to grep for here — that's what makes it the
sneakiest of the three. It happens when a local `.env` (`DATABASE_URL` and
`DIRECT_URL` pointed at `localhost:5432`) gets copied into Vercel's dashboard
verbatim. The build compiles fine, because `next build` never opens a database
connection. The first request that touches the database — any real page
load — fails, because `localhost` inside a Vercel serverless function
resolves to that function's own container, where nothing is listening on port
5432. What you'll see in Runtime Logs is a plain connection refusal in the
shape of `ECONNREFUSED 127.0.0.1:5432`, not a Prisma-branded message — it's a
generic Node.js network failure by the time it surfaces.

**Fix:** open Vercel → Settings → Environment Variables and confirm neither
`DATABASE_URL` nor `DIRECT_URL` contains `localhost` or `127.0.0.1`. Both must
be the Supabase pooler strings from §0 — `...pooler.supabase.com` — never a
host that only resolves on the machine that ran `npm install`.

### Failure 3 — build is green, some pages 200, others 500

`/login` returns 200. `/`, `/programs` and `/forum` return 500. Every
environment variable is correct — project, region, and credentials all check
out; this is not Failure 1 or Failure 2 again. The difference between the
pages that work and the ones that don't is which of them touch the database:
`/login` renders a static form, the other three query `Program`, `ForumPost`,
and similar tables.

**What it means:** a green build only proves the TypeScript compiled and the
pages that don't need data can render. It proves nothing about whether
`npx prisma migrate deploy` was ever run **against this specific database**. A
freshly created Supabase project has zero tables. Every query against it
fails, and only the routes that issue one show it — which is why the symptom
is a *mix* of 200s and 500s rather than a uniformly broken site.

**Fix:** from your machine, with `DIRECT_URL` pointed at the real project,
run:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Then reload the site — nothing needs to rebuild, since the fix is in the
database, not the code. Mixed 200/500 behaviour where the 500s cluster
exactly on the routes that query the database is the tell for this failure;
don't chase it as an application bug.
