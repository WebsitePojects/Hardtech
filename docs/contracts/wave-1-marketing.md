# Wave 1 contract — app shell + marketing routes

Five builders run in parallel. This file is the single source of truth for who
owns what and what the interfaces between them are. If two builders disagree,
this document wins.

## Goal

The seven public routes render with real data from Postgres, matching the
screenshots in `docs/screens/`.

## Acceptance criteria (observable, not effort-based)

- `npm run verify` exits 0 (typecheck, then lint, then build — all three).
- All seven marketing routes appear in the `next build` route table.
- No builder has touched a path it does not own.
- Copy text matches `docs/screens/` verbatim. No paraphrasing.
- Colour comes only from tokens in `src/app/globals.css`. No raw hex in components.

## Ownership map

Everything not listed under your name is **read-only** to you.

| Builder | Owns |
|---|---|
| **DATA** | `prisma/seed.ts`, `src/server/repositories/**`, `src/server/services/**`, `src/server/schemas/**` |
| **SHELL** | `src/components/layout/**`, `src/app/(marketing)/layout.tsx` |
| **ROUTES-A** | `src/app/(marketing)/page.tsx`, `src/app/(marketing)/about/**`, `src/features/home/**`, `src/features/about/**` |
| **ROUTES-B** | `src/app/(marketing)/programs/**`, `src/app/(marketing)/enroll/**`, `src/features/programs/**`, `src/features/enroll/**` |
| **ROUTES-C** | `src/app/(marketing)/gallery/**`, `src/app/(marketing)/contact/**`, `src/app/(marketing)/help/**`, `src/features/gallery/**`, `src/features/contact/**`, `src/features/help/**` |

Orchestrator-owned, nobody else edits: `src/components/ui/**`, `src/app/globals.css`,
`src/app/layout.tsx`, `src/server/db.ts`, `prisma/schema.prisma`,
`prisma/migrations/**`, `package.json`, `next.config.ts`, `components.json`.

`src/app/page.tsx` (the create-next-app placeholder) is deleted by the
orchestrator when the route group lands. Do not create or edit it.

## Route group

All seven routes live in the `(marketing)` route group so they share one layout
without adding a URL segment:

```
src/app/(marketing)/layout.tsx        SHELL
src/app/(marketing)/page.tsx          /            ROUTES-A
src/app/(marketing)/about/page.tsx    /about       ROUTES-A
src/app/(marketing)/programs/page.tsx /programs    ROUTES-B
src/app/(marketing)/enroll/page.tsx   /enroll      ROUTES-B
src/app/(marketing)/gallery/page.tsx  /gallery     ROUTES-C
src/app/(marketing)/contact/page.tsx  /contact     ROUTES-C
src/app/(marketing)/help/page.tsx     /help        ROUTES-C
```

## The interface between DATA and the route builders

DATA implements exactly this module. Route builders import from it and nothing
deeper — never a repository, never `db` directly.

```ts
// src/server/services/marketing.service.ts
import type {
  Program, ProgramCurriculumTopic, TrainerProfile, User,
  Testimonial, GalleryPhoto, Faq, PaymentMethodConfig,
} from "@/../generated/prisma/client";

export type ProgramWithCurriculum = Program & {
  curriculumTopics: ProgramCurriculumTopic[];
};
export type TrainerWithUser = TrainerProfile & { user: User };

export function getPrograms(): Promise<ProgramWithCurriculum[]>;
export function getProgramByShortName(
  shortName: string,
): Promise<ProgramWithCurriculum | null>;
export function getTrainers(): Promise<TrainerWithUser[]>;
export function getTestimonials(): Promise<Testimonial[]>;
export function getGalleryPhotos(): Promise<GalleryPhoto[]>;
export function getFaqs(): Promise<Faq[]>;
export function getPaymentMethods(): Promise<PaymentMethodConfig[]>;
```

All list functions return rows already ordered by their `sortOrder` where the
model has one, so pages never sort in the view layer.

Route builders may write `await getPrograms()` in a server component before
DATA has landed. Typecheck will fail until it does; that is expected and the
orchestrator resolves it at wave verification.

## The interface between SHELL and the route builders

SHELL owns the layout and the chrome. Route builders render **page content
only** — no navbar, no footer, no page-level `<html>`/`<body>`.

```tsx
// src/app/(marketing)/layout.tsx — SHELL
export default function MarketingLayout({
  children,
}: { children: React.ReactNode }) { /* navbar, {children}, footer */ }
```

## Design rules for every builder

Read `.claude/rules/20-design-fidelity.md` first, then your slice of
`docs/screens/`.

- **Dark is the theme.** `dark` is already on `<html>`. Every screenshot is dark.
- **Use tokens, never raw hex.** `bg-surface`, `text-muted-foreground`,
  `border-glass-border`, `text-neon`. The full token list is in
  `docs/research/01-design-source.md`.
- **The `glass` utility class** in `globals.css` is the floating translucent
  shell used by the navbar and cards. Use it rather than reinventing the effect.
  `hero-glow` and `dashboard-glow` are also defined there.
- **Icons are lucide-react.** Named imports only.
- **shadcn primitives already exist** in `src/components/ui/` — 27 of them
  including Card, Badge, Button, Tabs, Accordion, Carousel, Sheet, Dialog,
  Select, Table. Do not re-add them and do not edit them.
- There is no shadcn `Form` component in this registry. For forms use
  `react-hook-form` with `@hookform/resolvers/zod` plus `Label` and `Input`
  directly.

## Next.js 16 rules that will bite you

Read `.claude/rules/30-nextjs-16.md`. The ones that matter in wave 1:

- `params` and `searchParams` are **Promises**. `const { slug } = await props.params`.
  The Next 15 synchronous form does not compile.
- Server components by default. Add `"use client"` only where interactivity
  requires it, and push it as far down the tree as possible — a carousel needs
  it, a hero section does not.
- Do not add a `webpack` config. Turbopack is the default and a webpack config
  fails the build.

## Code discipline

- KISS. Simplest construction that satisfies the criteria.
- Extract on the third repetition, not the first.
- One module, one reason to change. A file that fetches, transforms, and renders
  is three files.
- View components take props and stay presentational. Data access is the
  service layer's job.
- Name things for what they are. No `data`, `item`, or a `utils.ts` dumping ground.
- No `any` to silence the compiler. No empty catch.

## Return format

Return a short diff receipt: every path you created or edited, one line each,
plus anything in your slice of the spec you could not implement and why.
Do not paste code back.
