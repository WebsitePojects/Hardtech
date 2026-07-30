# Wave 2 contract — auth, dashboard shell, forum

Builds the authenticated half of the product. Same rules as wave 1: disjoint
ownership, this file wins any disagreement.

Wave 1 shipped `/`, `/about`, `/programs`, `/enroll`, `/gallery`, `/contact`,
`/help` — all green. Read `docs/contracts/wave-1-marketing.md` for the patterns
already established, and copy them.

## Ownership map

| Builder | Owns |
|---|---|
| **AUTH** | `src/app/(auth)/**`, `src/server/auth/**`, `proxy.ts`, `src/server/schemas/auth.schema.ts` |
| **DATA-2** | `src/server/repositories/**` (new files only), `src/server/services/forum.service.ts`, `src/server/services/dashboard.service.ts`, `prisma/seed.ts` |
| **DASH-SHELL** | `src/app/(dashboard)/**` layout + `/dashboard` router only, `src/components/dashboard/**` |
| **FORUM** | `src/app/(app)/forum/**`, `src/app/(app)/communities/**`, `src/features/forum/**`, `src/features/communities/**` |

Orchestrator-owned, nobody edits: `src/components/ui/**`, `src/app/globals.css`,
`src/app/layout.tsx`, `src/server/db.ts`, `prisma/schema.prisma`,
`prisma/migrations/**`, `package.json`, `next.config.ts`,
`src/server/services/marketing.service.ts`, everything under
`src/app/(marketing)/**`, `src/components/layout/**`, `src/features/{home,about,programs,enroll,gallery,contact,help}/**`.

**DATA-2 caveat:** you may CREATE new repository files but must not edit the six
that already exist. `prisma/seed.ts` is yours to EXTEND — read it first and add
to it; do not rewrite what wave 1 seeded.

## Routes in this wave

```
/login                  AUTH
/forgot-password        AUTH
/dashboard              DASH-SHELL  (role router — redirects by session role)
/forum                  FORUM
/forum/leaderboard      FORUM
/forum/[id]             FORUM
/communities            FORUM
/communities/[slug]     FORUM
```

`/dashboard/trainee`, `/dashboard/trainer`, `/dashboard/admin` are **wave 3**.
DASH-SHELL builds only the layout, sidebar, and the `/dashboard` redirect.

## Fidelity is the requirement

This is a 1:1 rebuild. `.claude/rules/20-design-fidelity.md` is binding:

- **Transcribe copy verbatim** from `docs/screens/`. Do not paraphrase, do not
  improve wording, do not fix the source's typos or capitalization. The Iloilo
  community description really does say "Ilonngo" — ship it as-is.
- **Invent nothing.** No made-up names, emails, counts, or services. If the
  screenshots do not contain it, mark it `NOT SOURCED` inline and report it.
  A plausible-looking fabrication is worse than a visible gap.
- **Colour from tokens only.** No raw hex. `docs/research/01-design-source.md`
  has the full set.

## Auth behaviour — read this carefully

The reference site is a demo and `/login` ships **pre-filled demo credentials**
plus a visible "TEST CREDENTIALS" box listing admin / trainer / trainee emails
with **"password: any value"**. `docs/screens/desktop-02.md` captures it.

Reproduce that exactly — it is the product spec, not an accident. Transcribe the
real demo email addresses from the screenshots; do not invent them.

Constraints on how you implement it:

- The permissive password check lives in **exactly one** function,
  `verifyDemoCredentials`, with a comment block explaining that it accepts any
  password by design because the reference does.
- Gate it on `DEMO_AUTH`. Default on in development. If `NODE_ENV === "production"`
  and `DEMO_AUTH` is not explicitly `"true"`, the function must **fail closed** and
  reject every login. Rule 3 of the non-negotiables: unrecognized state rejects.
- **Everything downstream of the password check is real.** The session is
  server-side and httpOnly. The role comes off the session on the server for
  every gated route. Rate-limit the login endpoint. Return generic auth errors.
- The navbar role chip is display only and is never an authorization input.

## proxy.ts, not middleware.ts

Next 16 renamed it. The file is `proxy.ts` at the repo root, the export is
`proxy`, and the runtime is `nodejs` and not configurable. See
`.claude/rules/30-nextjs-16.md` §2. Role-gate `/dashboard/*` here, and re-check
on the server inside each route — a proxy check alone is not authorization.

## Next 16 rules that will bite

- `params` and `searchParams` are Promises. `const { id } = await props.params`.
  This hits `/forum/[id]` and `/communities/[slug]` directly.
- Run `npx next typegen` and use `PageProps<'/forum/[id]'>` rather than
  hand-writing param types.
- Mutations that the user must see immediately (post, reply, vote, bookmark)
  use `updateTag`, not `revalidateTag`. `revalidateTag` now needs a second
  argument and gives stale-while-revalidate, which is wrong for your own write.
- Server components by default.

## Every mutating path in this wave

`.claude/rules/00-non-negotiables.md` is binding, and the forum is full of
mutations. For each of post, reply, vote, bookmark, report:

- Disabled control + pending state + handler early-return. All three.
- Votes and bookmarks are **toggles** and must be idempotent per
  `(user, target)`. The compound unique constraints already exist in the
  schema — rely on them, never read-then-write.
- Trainee posts require approval. Approve and reject are **conditional UPDATEs
  guarded on current state**, so two moderators acting at once cannot both fire
  side effects.
- The database also enforces this: a user cannot self-approve a post and cannot
  self-rate. Those CHECK constraints are live and tested. Do not fight them.

If a mutation cannot be completed in this wave, use the wave-1 `/enroll`
pattern: build the guards for real and call a `TODO(wave-3)` stub that throws.
**Never fake a successful write.**

## Verification before you return

```
npx tsc --noEmit
npx eslint <your paths>
```

A database is running and seeded. `.env` is configured. You can also
`curl http://localhost:3000/<route>` — the dev server is up.

Errors in another builder's paths are expected while the wave is in flight.
Report only errors in paths you own.

## Return format

A diff receipt, one line per path. Then: every place you found no source and
what you did about it, and for any mutating control, where its three guards are
by file and identifier. No pasted code.
