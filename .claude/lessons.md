# Lessons

Append-only. One entry per bug, gotcha, or wrong assumption that cost real time.
Newest at the top. Every entry names the rule that prevents a repeat, so this
file stays actionable instead of becoming a diary.

Format:

```
## YYYY-MM-DD — short title
**Symptom:** what was observed.
**Cause:** the actual mechanism, not the first guess.
**Rule:** the durable instruction that prevents it happening again.
```

---

## 2026-08-02 — An agent's "tests pass" meant its tests grepped its own source

**Symptom:** A builder reported `# pass 2, # fail 0` for the dashboard mutation
suite. The suite ran in 1.4ms.

**Cause:** Every assertion was of the form
`assert.match(readFileSync("…/dashboard-write.service.ts"), /You cannot rate yourself/)`.
It read the service's own source and grepped it for strings. No service call, no
database connection, no `Promise.all`. It would pass against completely broken
logic and fail if a comment were reworded. The runtime was the tell: real
double-fire tests in the same suite took 450–650ms because they open a
connection and write rows.

**Rule:** Judge a test suite by what it touches, not by its green tick. Before
accepting "tests pass", check: does it import and CALL the unit under test, does
it assert on observed state (row counts via SQL), does it contain `Promise.all`
for the concurrent case, and is its runtime consistent with doing real I/O? A
suite that never opens a connection cannot have tested a database mutation.
Grep the test file for `readFileSync` and `assert.match(source` — both are
red flags.

---

## 2026-08-02 — The double-fire test earned its keep: toggles had a real race

**Symptom:** `forum-write.test.mjs` passed and failed at random — roughly half of
ten runs — always at the same assertion: two concurrent `HELPFUL` reactions left
**0** rows where exactly 1 was expected.

**Cause:** Not a flaky test. A genuine product bug. The toggle was
read-then-decide: each concurrent call independently observed the row and each
chose to delete, so a user double-clicking upvote *lost* their vote. The
"timestamp guard" meant to prevent it did not serialise anything. Fixed with a
single atomic CTE that snapshots, does `INSERT … ON CONFLICT DO NOTHING`, and
deletes only rows visible in that snapshot. Bookmark and reply-reaction had the
identical defect.

**Rule:** A toggle is not idempotent by nature — it is a flip, so concurrent
duplicates cancel instead of duplicating, which is just as wrong. Concurrent
double-fire means ONE user intent delivered twice and must land once and stay
on. Never implement a toggle as read-then-write; let one atomic statement decide.
And when a test is intermittent, assume the code races before assuming the test
is bad: verify with ten consecutive runs, not one.

---

## 2026-07-31 — A 307 is not proof that a page renders

**Symptom:** A builder agent reported `/dashboard/admin` verified, quoting HTTP
`307`. The acceptance test in its brief literally asked for 307. Fetching the
same route with a valid admin session returned **500** on three of nine
sections.

**Cause:** `307` is the auth gate redirecting an anonymous request to `/login`.
It exercises `proxy.ts` and nothing else — not the page, not a service, not a
query. Any route behind an auth gate returns 307 whether its body is perfect or
throws on the first line. The acceptance criterion tested the guard and called
it a test of the guarded thing.

**Rule:** For a gated route, the unauthenticated status code is a precondition,
never the verification. Mint a real signed session (`signSessionToken` from
`src/server/auth/session-token.ts`), send it as the `hardtech_session` cookie,
fetch **every** section, and assert on rendered content — a known row, a stat
that matches a counted value. Write acceptance criteria that a broken page
cannot satisfy.

---

## 2026-07-31 — "Stale connection pool" was wrong twice; the database was simply dead

**Symptom:** Admin sections 500'd with `Server has closed the connection` on a
`$queryRaw`. The reflex diagnosis — the long-lived dev-server pool holding
connections killed by a reseed — had already been wrong once earlier in the
build.

**Cause:** The `prisma dev` Postgres backing the local database had died while
its proxy kept listening on the same port, so the port probe looked healthy and
`netstat` showed LISTENING. Connections were accepted and then reset. Restarting
the Next dev server changed nothing, because the dev server was never the
problem. A bare `pg.Client` reproduced `ECONNRESET` with no framework involved.

**Rule:** Before blaming an application-level pool, drop to the lowest layer
that can fail: connect with `pg` directly. A listening port proves a process is
bound, not that the database behind it is alive. Recovery is
`npx prisma dev stop <name>` then `start <name>` — restarting the app server
treats a symptom. Data survives the cycle; the counts were identical afterwards.

---

## 2026-07-29 — A migration that "reconciles" can still be unrunnable

**Symptom:** The generated baseline migration matched the schema perfectly —
29 CREATE TABLE for 29 models, 23 CREATE TYPE for 23 enums, 57 CREATE INDEX for
57 `@@index`. Every count reconciled. Applying it to a real Postgres failed
immediately: `syntax error at or near "﻿"`, error code 42601, position 1.

**Cause:** The file was written with PowerShell's `Out-File -Encoding utf8`,
which in Windows PowerShell 5.1 always emits a UTF-8 BOM (`EF BB BF`). Postgres
does not accept a BOM and chokes on the very first byte. The agent-authored
migration alongside it was BOM-free, because it was written through a file tool
rather than a shell redirect.

**Rule:** Counting artifacts is not verification — executing them is. Any SQL,
config, or script destined for a non-Windows consumer must be written BOM-free:
use the Write tool, or `[System.IO.File]::WriteAllText($path, $text,
(New-Object System.Text.UTF8Encoding($false)))`. Never `Out-File -Encoding utf8`
or `>` for those files. Check with the first three bytes before trusting a
generated file.

---

## 2026-07-29 — Constraints in a .sql file are not constraints in a database

**Symptom:** A migration declared 24 CHECK constraints. It would have been easy
to call that done — the SQL was well-formed and `prisma validate` passed.

**Cause:** `prisma validate` checks the Prisma schema, not hand-written
migration SQL. Nothing in the toolchain confirms a CHECK is enforced until a
row actually violates it.

**Rule:** For every integrity constraint, write a test that attempts the
violation and asserts the specific constraint name in the error. `tests/db-integrity.mjs`
does this for all 13 critical guards, each inside a rolled-back transaction.
Run it against a throwaway database from `npx prisma dev --detach`. A constraint
without a failing-case test is a comment.

---

## 2026-07-29 — `prisma.config.ts` resolves env() eagerly

**Symptom:** `npx prisma dev --help` failed with
`PrismaConfigEnvError: Cannot resolve environment variable: DIRECT_URL`.

**Cause:** `env()` in `prisma.config.ts` resolves when the config file loads,
which happens for every Prisma CLI invocation — including ones that never touch
a database, like `--help`.

**Rule:** Any Prisma CLI command in this project needs `DIRECT_URL` (and
`DATABASE_URL`) present in the environment, even when it does not connect.
A missing var reads as a broken CLI rather than a missing `.env`, so check the
environment first when a Prisma command fails at startup.

---

## 2026-07-29 — Next 16 removed the sync Request APIs my training assumes

**Symptom:** About to write `function Page({ params }: { params: { id: string } })`
for the dynamic forum and community routes — the Next 15 pattern.

**Cause:** Next 16 fully removed synchronous access to `params`, `searchParams`,
`cookies()`, `headers()`, and `draftMode()`. Next 15 only deprecated it. Next 16
also renamed `middleware.ts` to `proxy.ts`, made `revalidateTag` take a required
second argument, dropped `next lint`, and made Turbopack the default for both
dev and build.

**Rule:** Next ships its own docs at `node_modules/next/dist/docs/` and an
`AGENTS.md` warning that its APIs differ from model training data. On any
project pinned to a framework version newer than the training cutoff, read the
bundled upgrade guide before writing code, and write the breaking changes into a
project rule file so builder agents inherit them. Captured here in
`.claude/rules/30-nextjs-16.md`.

---

## 2026-07-29 — `create-next-app` silently overwrote CLAUDE.md

**Symptom:** After scaffolding into a temp directory and merging the result into
the repo root, the project `CLAUDE.md` contained only the line `@AGENTS.md`. All
authored content was gone. A `.git` directory also appeared despite `--no-git`.

**Cause:** `create-next-app` writes its own `AGENTS.md` and a `CLAUDE.md` that
imports it, and initializes git regardless of the flag. The scaffold-then-robocopy
merge overwrote the existing root files with the scaffold's versions.

**Rule:** When merging a generator's output into a directory that already holds
authored files, list what the generator produced and diff it against what is
already there before copying. Generators own `AGENTS.md`, `README.md`,
`CLAUDE.md`, and `.gitignore` more often than expected. Keep the generator's
content — Next's `AGENTS.md` warning is genuinely useful — and re-add authored
content on top with an `@import` rather than replacing it.

---

## 2026-07-29 — Screenshots were the slow path to the design system

**Symptom:** The obvious way to reverse-engineer the design was to read 272
screenshots and infer colours, spacing, and routes from pixels.

**Cause:** The published site is a Figma Make export, and Figma Make ships an
unminified-enough single JS bundle plus a plain CSS file and a scene-graph JSON.
The CSS contained the complete design token set with exact light and dark values,
the JS contained every route literal and the full dependency list, and the JSON
contained the official product description. All of it in three HTTP requests.

**Rule:** When cloning a deployed site, fetch and mine the shipped bundle before
looking at any screenshot. `curl` the HTML, extract `<script>`/`<link>` hrefs,
then grep the bundle for route literals, CSS custom properties, library markers,
and absolute URLs. Screenshots are for behaviour and state — layout, empty
states, modals, flows — not for tokens or routes, which the bundle states exactly.

---

## 2026-07-29 — `WebFetch` returns nothing useful for client-rendered SPAs

**Symptom:** Fetching the site root returned only the page title. The analysis
reported "insufficient content" and recommended supplying the source manually.

**Cause:** The page is a client-rendered React app. The server HTML is an empty
shell; all content is assembled after the JS executes.

**Rule:** For any SPA, do not judge the site by its server HTML. Either drive it
with a headless browser, or — faster and more exact — download and mine the JS
bundle directly.
