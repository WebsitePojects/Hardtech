# Deploying HardTech — Vercel + Supabase + Hostinger domain

Step-by-step. Follow in order. Every value you need to paste is marked **FILL**.

Repository: `https://github.com/WebsitePojects/Hardtech`
Supabase project ref: `ouggrddmugbcrmqkxiqu`

---

## 0 — Which Supabase "Connect" tab to use

The Connect dialog offers five tabs. You need **exactly one**.

| Tab | Use it? | Why |
|---|---|---|
| **ORM → Prisma** | ✅ **YES** | Gives both connection strings in the exact shape Prisma needs. |
| Framework → Next.js | ❌ No | Installs `@supabase/supabase-js`. This app does not use it — it talks to Postgres through Prisma. Adding it would install a second, unused data layer. |
| Direct → Direct connection | ❌ No | Gives `db.ouggrddmugbcrmqkxiqu.supabase.co`, which is **IPv6-only**. Vercel's build and function network, and most home ISPs, cannot reach it without the paid IPv4 add-on. |
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
DATABASE_URL="postgresql://postgres.ouggrddmugbcrmqkxiqu:FILL-PASSWORD@aws-0-FILL-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.ouggrddmugbcrmqkxiqu:FILL-PASSWORD@aws-0-FILL-REGION.pooler.supabase.com:5432/postgres"
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
build, not just runtime. Set each for **Production, Preview and Development**.

| Name | Value |
|---|---|
| `DATABASE_URL` | **FILL** — port 6543 string, ending `?pgbouncer=true` |
| `DIRECT_URL` | **FILL** — port 5432 string |
| `AUTH_SECRET` | **FILL** — output of step 2 |

That is the complete list. The app reads only `AUTH_SECRET`, `DATABASE_URL`,
`DEMO_AUTH` and `NODE_ENV`.

**Do not set `AUTH_URL`.** It appears in `.env.example` but no code reads it.

### ⚠️ Do not set `DEMO_AUTH`

Leaving it unset is what enables real password verification.

`DEMO_AUTH="true"` in production makes every seeded account accept **any
password**. It exists to reproduce the reference site's public demo box. It
fails closed — unset, empty, or any other value rejects demo logins — so the
safe action is simply to never add the variable.

---

## 5 — Deploy

Click **Deploy**. Then open the `*.vercel.app` URL and check:

- home page renders
- `/programs` lists programs from the database
- `/login` accepts a seeded account
- `/dashboard` loads after login

If the build fails on a missing Prisma client, confirm `postinstall` is present
in `package.json` — `generated/prisma` is gitignored, so the client only exists
if `prisma generate` runs during install.

---

## 6 — Hostinger domain

### 6a. Add the domain in Vercel

Vercel → Project → **Settings → Domains → Add**.

Enter your domain, e.g. `hardtech.com`. Vercel then shows the **exact DNS
records to create**. Use the values on that screen — do not copy them from a
blog post, Vercel has changed its apex IP and stale values silently fail.

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

Nothing to redeploy after the domain attaches. The app reads no origin from env.

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

### Uploads are not wired to storage

Gallery and avatar images are seeded paths. If you want user uploads, create a
Supabase Storage bucket and connect it. Nothing in the current build writes
files.

---

## Redeploying later

Push to `main`. Vercel builds automatically.

If a push includes a schema change, run `npx prisma migrate deploy` from your
machine against `DIRECT_URL` **before or after** the deploy — never as part of
the Vercel build.

Lint is not part of the build. Next 16 removed `next lint`, so `next build`
compiles without linting. Run `npm run verify` locally — typecheck, lint, tests
and build in one command — before pushing.
