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
