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

## 2026-08-18 — A Tailwind v4 theme token was never registered, killing 18 hover states

**Symptom:** `hover:bg-glass-hover` appeared at 18 call sites across the app —
`src/components/dashboard/dashboard-sidebar-nav.tsx`,
`src/app/(app)/forum/[id]/page.tsx`,
`src/app/(app)/forum/leaderboard/page.tsx`, `src/components/layout/footer.tsx`,
`src/components/layout/navbar-actions.tsx`,
`src/features/dashboard-admin/components/trainer-card.tsx`,
`src/features/dashboard-admin/sections/overview-section.tsx`,
`src/features/dashboard-trainee/session-schedule-section.tsx`, and others.
None of them ever painted. The source looked correct in every one.

**Cause:** In Tailwind v4 a utility only exists if its token is registered in
the `@theme` block. `src/app/globals.css` registered
`--color-glass: var(--glass-bg)` and `--color-glass-border: var(--glass-border)`
but **not** `--color-glass-hover`. The underlying `--glass-hover` variable was
defined in both light and dark themes and was already being consumed by the
`.glass-hover:hover` class, so the *value* was never missing — only the theme
registration that turns it into a utility. Verified empirically by grepping the
built stylesheet under `.next/static/`: `bg-glass-hover` occurred **0** times
while its registered siblings `bg-glass` and `border-glass-border` occurred once
each. After adding `--color-glass-hover: var(--glass-hover)` to `@theme`, the
built CSS emitted `bg-glass-hover:hover{background-color:var(--glass-hover)}`.

**Rule:** This is the same failure class as the 2026-08-09 entry "`.glass`
shipped without its blur for the whole project" — *a declaration present in
source is not necessarily present in the browser.* Verify a new colour utility
by grepping the **built** CSS, not by reading the source, and check that every
`--<name>` intended as a utility has a matching `--color-<name>` in `@theme`.

---

## 2026-08-18 — A shared button primitive disabled its own error state and deadlocked the login form

**Symptom:** A new shared `MorphingButton` primitive
(`src/components/ui/morphing-button.tsx`) derived
`disabled={disabled || state !== "idle"}`. Adopted in
`src/app/(auth)/login/login-form.tsx`, one failed login attempt made the form
permanently unusable until a full page reload.

**Cause:** Walk the exact sequence: a failed submit sets `error`; the call site
maps that to `state="error"`; the primitive disables the button; but `error` is
only cleared inside `handleSubmit`, which starts with `setError(null)`; and
`handleSubmit` can only run on form submission, which requires the submit
button. Enter-key implicit submission does not rescue it either — the HTML
specification skips implicit submission when the form's default button is
disabled. So the only path that clears the error is gated behind the control
the error disabled. Fixed by narrowing the derivation to
`disabled={disabled || state === "pending"}`: `pending` is genuinely in-flight
and must disable, while `error` and `success` are terminal states that must
not.

**Rule:** A "disabled while busy" rule must disable only the *in-flight* state,
never a terminal one. More broadly, whenever a component disables a control,
check whether the only code path that clears the disabling condition runs
through that same control — that is a self-locking cycle, and it is invisible
to a typecheck, a lint, and a build. `success` was also left enabled because the
component cannot know whether a given call site clears it via a handler behind
the same button; assuming "success precedes a redirect" would recreate the
identical deadlock one state over.

---

## 2026-08-18 — A test asserted on the wrong property path and leaked credentials when it failed

**Symptom:** `tests/mutations/certificate-chain.test.mjs` failed on
`assert.rejects(promise, /not found/i)` with the message "the asset must
actually be gone from Cloudinary after cleanup, not just reported gone". The
rejection *did* occur and the rejected value *did* contain
`Resource not found - hardtech/certificates/...` with `http_code: 404` — i.e.
the behaviour under test was correct the whole time. The failure had been
mis-attributed to a stale Cloudinary API secret; a direct Admin API call
returned HTTP 200, disproving that.

**Cause:** Two distinct defects, both in the test. (1) `assert.rejects(promise,
/regex/)` matches the regex against the thrown value's top-level `message`
property. The Cloudinary SDK rejects with
`{ request_options, query_params, error: { message, http_code } }` — there is
no top-level `message`, so the regex could never match regardless of how
correct the code was. (2) On failure, Node prints the assertion's raw `actual`
value, and `request_options` contains an `auth` field holding the live
`apiKey:apiSecret` pair — so a failing test wrote real credentials in plaintext
to stdout, CI logs, and any pasted output, violating rule #6 of
`.claude/rules/00-non-negotiables.md`. Fixed by replacing the regex matcher
with a manual `try/catch` that extracts only `http_code` and the nested message
into locals and asserts on those, so the raw SDK object is never handed to an
assertion.

**Rule:** On matching: when asserting against an error from a third-party SDK,
verify the actual shape of the rejected value before choosing a matcher — a
rejection carrying the right information at the wrong property path fails
identically to a genuine defect, which sends you hunting the product code. On
leakage: an assertion's `actual` value is printed verbatim on failure, so never
pass a raw provider/request object to an assertion — extract the specific
fields you mean to check first. Asserting on a structured field
(`http_code === 404`) is stronger than a message regex; a bare "rejects with
anything" would silently accept a 401 or a network error and destroy the
guarantee.

---

## 2026-08-16 — Next 16 immediate invalidation means `updateTag`, not old `revalidateTag`

**Symptom:** Mutating actions for dashboard, forum, enrollment, and messages
needed immediate post-write UI freshness under Next 16.

**Cause:** Next 16 changed the cache API contract: `revalidateTag` now requires
a profile argument and is stale-while-revalidate, so it is the wrong primitive
for user-owned writes that must reflect immediately. The verified action files
import `updateTag` from `next/cache` and call it only after successful writes.

**Rule:** On Next 16, use `updateTag("<domain>")` for read-your-own-write
mutations and reserve `revalidateTag` for explicitly stale refresh semantics.
Verify this by grepping the action layer for `revalidateTag` before accepting a
wave receipt; a compile pass alone does not prove the cache semantics are right.

---

## 2026-08-16 — Messaging writes must be duplicate-safe as transactions, not just guarded buttons

**Symptom:** The messaging wave added direct conversation creation, message
send, unread increments, attachment binding, and mark-read state changes; each
path can be double-fired by retries, impatient clicks, or concurrent requests.

**Cause:** UI pending guards prevent accidental double-clicks but cannot stop a
replayed request. The service layer now enforces one direct conversation via
`directKey`, one message via `idempotencyKey`, participant-scoped reads/writes,
owned active attachment binding, and conditional mark-read updates. Tests prove
sequential and concurrent duplicate sends return the same row and increment
unread counts only once.

**Rule:** For messaging, the database transaction owns correctness: unique key
or `ON CONFLICT`, validate actor scope inside the transaction, and fire side
effects only on the inserted/changed row. Client handlers still need disabled,
pending, and early-return guards, but they are UX protection, not the duplicate
safety boundary.

---

## 2026-08-16 — GET routes must not create conversations

**Symptom:** `/messages/new?to=...` is a tempting place to call
`getOrCreateDirectConversation` during render so the page can immediately
redirect into a thread.

**Cause:** That would make a GET request mutate state: crawlers, prefetches,
reloads, or merely viewing an author avatar link could create conversations and
participant rows. The page now only validates `searchParams` and session, while
the get-or-create call stays behind an explicit client confirmation with
pending, disabled, and early-return guards.

**Rule:** Any route named `new`, `preview`, or `confirm` must be audited for
GET-side writes. A GET page may authenticate and validate, but creation belongs
in a user-triggered action. Add a route-safety test that rejects imports or
calls to the write service from the GET component.

---

## 2026-08-16 — Forum post/reply creation needs unique keys plus exactly-once side effects

**Symptom:** Forum post/reply creation previously relied on application flow;
duplicate submits could create duplicate posts or replies, and reply side
effects could drift from the row count.

**Cause:** Creation is not naturally idempotent. The wave 3 migration added
nullable `idempotencyKey` columns and concurrent unique indexes for
`ForumPost` and `Reply`, preserving legacy rows while making new create intents
database-enforced. The service recovers `P2002` unique violations by loading the
existing row for the same actor/input, and tests assert sequential and
concurrent duplicates produce one row, one counter increment, and one
notification per real reply.

**Rule:** New create endpoints require a client-minted idempotency key that is
persisted under a unique constraint. Side effects such as counters and
notifications must happen in the same winning transaction and must be tested
with both sequential replay and `Promise.all` concurrency.

---

## 2026-08-16 — Test fixtures must be hermetic, and DB integrity tests need an isolated database

**Symptom:** Storage and database verification can look green while depending
on developer-machine state or mutating a shared database.

**Cause:** The Cloudinary signed-upload suite is intentionally hermetic: it sets
fake Cloudinary variables before importing the storage modules and never reads
real `.env` credentials or touches remote storage. By contrast,
`tests/db-integrity.mjs` executes real constraint violations, creates seed
records, and rolls back per assertion, so it must run against an isolated test
database with migrations applied, not a shared dev or production database.

**Rule:** Storage signature tests should provide fake provider fixtures inside
the test process and assert secrets never appear in returned objects. Integrity
scripts that exercise real SQL constraints must require an isolated
`TEST_DATABASE_URL` and should not be treated as safe smoke tests for a shared
database, even when most assertions roll back.

---

## 2026-08-14 — Cloudinary appends the file extension to `public_id` for raw, and our "delete" reported success against nothing

**Symptom:** A live probe of the new signed direct-upload path uploaded a PDF
with a server-minted `public_id` of `probe-raw-1786691760108`. Cloudinary stored
it as `hardtech/_probe/probe-raw-1786691760108**.pdf**`. Calling
`destroyAsset("hardtech/_probe/probe-raw-1786691760108", "raw")` — the handle we
would have persisted — returned **`true`**. The same probe run for an image
returned an identical `public_id` with no suffix, so the defect is invisible
unless raw is tested specifically.

**Cause:** Two mechanisms compounding.

For `resource_type: raw`, Cloudinary treats the extension as part of the
identity and appends it to `public_id` (its `format` field comes back
`undefined`). For `image` and `video` the extension is stripped and reported
separately in `format`, so the id we mint and the id Cloudinary stores are
identical — which is why every image test passed. Raw is the training-module
path: PDF and DOCX.

The second mechanism is what made it silent. `destroyAsset` deliberately maps
Cloudinary's `not found` result to success, because a cleanup path must be safe
to retry and "already gone" satisfies the goal state. That is correct for
retries and exactly wrong as a correctness signal: destroying a `public_id` that
never existed is indistinguishable from destroying one that did. The purge
worker would have marked rows `PURGED`, with `purgedAt` set and the CHECK
constraint satisfied, while every PDF and DOCX stayed in Cloudinary forever.
The outbox would have reported a clean drain against a growing leak.

**Rule:** The authoritative `public_id` is the one the provider **returns**,
never the one we minted. Persist the returned value at confirm/webhook time,
and verify it is prefixed by the folder and id we signed — that keeps the
tamper protection (a client still cannot redirect the upload) without assuming
the provider echoes our id unchanged.

More generally: an idempotent delete that treats "absent" as success cannot also
serve as proof the delete worked. Prove storage cleanup by observing the object
is gone through a second channel — a `HEAD` on the delivery URL — not by the
destroy call's own return value. And test every resource type against the live
API before trusting a path; `image` passing says nothing about `raw`, and the
difference here is invisible to any unit test because it lives entirely in the
provider's naming behaviour.

---

## 2026-08-09 — A 3.5%-alpha grain texture "disappeared" in a 1x-DPI screenshot crop

**Symptom:** After implementing the `.cyber-bg::after` grain overlay (a 1px dot
matrix at `rgba(255,255,255,0.035)` on a 28px grid), a Playwright screenshot
cropped to a flat region of `/login` showed no dots at all, while the same
overlay was clearly visible in a crop of `/` taken the same way. Computed-style
diffing showed the two pages' `.cyber-bg::after` were byte-identical.

**Cause:** Not a rendering bug. The crop was captured at the default
`deviceScaleFactor: 1`. At 3.5% alpha, a 1px dot is a ~9/255 luminance step,
and at 1x scale Chromium's rasterizer + PNG encoder can flatten that step to
nothing in some regions depending on subpixel placement — it's a rendering
precision artifact of the capture, not the page. Re-capturing the identical
region with `deviceScaleFactor: 2` showed the dots clearly and evenly.

**Rule:** When verifying a texture or effect with alpha below roughly 5%,
screenshot at `deviceScaleFactor: 2` (or crop and zoom) before concluding it
is "missing" — a flat crop at 1x is not proof of absence at these alphas. This
is the same category of mistake as trusting a green checkmark without reading
output (`.claude/rules/00-non-negotiables.md` intent extended to visual
verification): re-measure at higher precision before reporting a delta.

---

## 2026-08-09 — I put an unmeasured spec in a brief and called it ground truth

**Symptom:** The brief for the forum sort menu stated its panel used the same
treatment as the navbar's Explore menu — `rgb(6,10,16)`, a green
`rgba(74,222,128,0.12)` hairline, a three-layer shadow, `z-index: 999999` — and
told the agent those numbers were measured. The agent re-measured the live
reference and found the sort menu is a different panel: `rgb(12,18,28)`, a
neutral `rgba(255,255,255,0.1)` hairline, one shadow layer, `z-index: 100`.

**Cause:** Only the Explore panel had actually been measured. Its values were
generalised to "dropdowns" and written into a second brief as fact. The
reference deliberately runs two menu surfaces — a dark green-edged mega-menu in
the navbar and a lighter neutral-edged menu in-page — and unifying them would
have been wrong in a way that looks tidy.

**Rule:** Measure each component, not each component *category*. A value carries
authority only for the element it was read from; reusing it elsewhere is an
inference and must be labelled as one. Briefs should say which numbers were
measured and which are assumed, and instruct the agent to re-measure and
override — that instruction is the only reason this was caught.

---

## 2026-08-09 — `.glass` shipped without its blur for the whole project

**Symptom:** The navbar looked flat next to the reference. `src/app/globals.css`
declared `backdrop-filter: blur(16px)` and `-webkit-backdrop-filter` on `.glass`,
and the rule was clearly applying — its `background-color` and `border` were
visible on the element.

**Cause:** Lightning CSS, which Turbopack runs over Tailwind v4, prunes a bare
`backdrop-filter` against its default browser targets. It does so silently: the
rule still ships, minus those two declarations. The served CSS read
`.glass { background-color: …; border: …; box-shadow: … }`. On the same page
`.backdrop-blur-md` computed to `blur(12px)`, because Tailwind emits its own
backdrop utilities inside `@supports ((-webkit-backdrop-filter: …) or
(backdrop-filter: …))`, and Lightning CSS will not prune inside that guard.
Setting the property inline restored it, proving browser support was never the
issue. Every glass surface in the app — navbar, forum rails, community cards —
had been flat translucent panels with no blur.

**Rule:** A declaration present in source is not necessarily present in the
browser. When a style computes to `none` but the rule is clearly matching, read
the **served** rule before suspecting selectors or specificity:
`for (const r of sheet.cssRules) if (/\.your-class/.test(r.selectorText)) console.log(r.cssText)`.
If the declaration is absent from `cssText`, the build removed it. Wrap
`backdrop-filter` in `@supports` — that is exactly how Tailwind protects its own.

---

## 2026-08-09 — A four-layer Tailwind arbitrary shadow computed to nothing

**Symptom:** `shadow-[0_24px_64px_0_rgba(0,0,0,0.55),0_8px_24px_0_rgba(…),inset_…,inset_…]`
produced `box-shadow: rgba(0,0,0,0) 0px 0px 0px 0px, …` — the utility applied,
the value was empty. The pill shipped with no shadow.

**Cause:** Tailwind did not parse the multi-layer arbitrary value with commas
and `inset` keywords. It emitted its shadow scaffolding with empty custom
properties rather than failing loudly.

**Rule:** Multi-layer shadows belong in a named CSS class, not an arbitrary
utility. And a Tailwind variant (`data-[x=true]:`) only composes with Tailwind
utilities — prefixing a **custom** class with one silently does nothing. Key the
CSS off the attribute instead: `.navbar-pill[data-scrolled="true"] { … }`.
Always confirm an arbitrary value by reading the computed style; a class that is
present in the DOM is not proof the value survived.

---

## 2026-08-09 — Two agents sharing one auth file killed both

**Symptom:** Two builder agents launched in parallel both died immediately:
`Your access token could not be refreshed because your refresh token was already
used.` Neither wrote a single file.

**Cause:** Both agent homes were seeded by copying the same `auth.json`. Refresh
tokens rotate on use, so the two processes refreshed concurrently and each
invalidated the other's token — and the shared source credential with it.

**Rule:** Credentials with rotating refresh tokens cannot be copied across
concurrent workers. Run such agents sequentially against one home, or give each
its own independently issued credential. When parallel workers fail *identically
and instantly*, suspect shared mutable state before suspecting the task.

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
