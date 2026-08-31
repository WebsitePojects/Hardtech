@AGENTS.md

# HardTech — project instructions

IT training platform for **HardTech IT Corp** (Quezon City, PH). Computer and
cellphone hardware servicing courses, with online enrollment, role-based
dashboards, and a regional community forum.

This is a **1:1 rebuild** of an existing Figma Make design. Fidelity to that
design is a hard requirement, not a preference.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.12, App Router, TypeScript, `src/` dir |
| React | 19.2.4 |
| Styling | Tailwind v4 + shadcn/ui |
| Icons | lucide-react |
| Charts | recharts |
| Toasts | sonner |
| ORM | Prisma |
| Database | Supabase Postgres |
| Validation | zod, at every boundary |

shadcn/ui is not a stylistic preference — the source design is itself a
shadcn/Tailwind-v4 build, so using it reproduces geometry exactly instead of
approximating it.

## Rules

@.claude/rules/00-non-negotiables.md
@.claude/rules/10-architecture.md
@.claude/rules/20-design-fidelity.md
@.claude/rules/30-nextjs-16.md
@.claude/rules/40-prisma-7.md
@.claude/rules/50-database.md

## Lessons

@.claude/lessons.md

Append to the lessons log after fixing any bug or hitting any gotcha. One entry,
dated, with the symptom, the cause, and the rule that prevents a repeat.

## Reference documents

- `docs/research/01-design-source.md` — design tokens, 20-route map, and library
  set extracted from the shipped Figma Make bundle. Ground truth for colour,
  spacing, typography, and routing. Prefer it over guessing.
- `docs/screens/` — per-screenshot UI specifications covering all 272 captures
  (63 desktop, 209 mobile) across 8 documents. Builders read these instead of
  the images.

## Commands

```
npm run dev     # Turbopack dev server, outputs to .next/dev
npm run build   # Turbopack production build (does NOT lint)
npm run lint    # eslint, separate step — a green build proves nothing about lint
npx next typegen   # regenerate PageProps/LayoutProps/RouteContext helpers
```

## Skill routing

- Multi-route or multi-layer build → invoke `/orchestrate`.
- Any creative or feature work → brainstorm before implementing.
- Bugs → systematic debugging before proposing a fix.
