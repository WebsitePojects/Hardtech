# Architecture

MVC-shaped layering inside Next.js App Router. The dependency arrow only ever
points one way:

```
route / page  →  service  →  repository  →  Prisma  →  Postgres
   (view)        (rules)      (data access)
```

## Directory contract

| Path | Owns | May import |
|---|---|---|
| `src/app/**` | Routing, layouts, pages, server actions, route handlers | services, view components |
| `src/components/ui/**` | shadcn primitives, unmodified where possible | nothing project-specific |
| `src/components/**` | Presentational components | ui primitives, types |
| `src/features/<name>/**` | Feature-scoped components and hooks | services, ui, types |
| `src/server/services/**` | Business rules, authorization, orchestration | repositories, schemas |
| `src/server/repositories/**` | All Prisma access. The only layer that imports the client | prisma, types |
| `src/server/schemas/**` | zod schemas for every boundary | nothing |
| `src/lib/**` | Pure helpers with no I/O | nothing |
| `prisma/**` | Schema and migrations. DBA-owned | — |

## Hard rules

- **A component never imports `prisma`.** If a component needs data, a server
  component calls a service, or the page passes props down. No exceptions.
- **A repository never contains business rules.** It reads and writes rows. If
  there is an `if` about eligibility, approval, or pricing in a repository, it
  belongs in a service.
- **A service never touches `req`/`res` or React.** It takes parsed input and
  returns typed output, so it stays testable without a server.
- **Every server action and route handler parses its input with a zod schema
  from `src/server/schemas/` before doing anything else.** Parse, don't cast.
- **Server components by default.** Add `"use client"` only where interactivity
  genuinely requires it, and push it as far down the tree as possible.
- **shadcn primitives in `src/components/ui/` stay close to upstream.** Project
  styling goes in wrapper components or tokens, so the primitives stay
  regenerable.

## Naming

- Files: kebab-case. React components: PascalCase. Hooks: `use-` prefix.
- Repositories: `<entity>.repository.ts`, exporting a single object or class.
- Services: `<domain>.service.ts`.
- Schemas: `<domain>.schema.ts`.
- No `utils.ts` catch-all. Name the module for what it does.

## Testing

Every service gets unit tests against a fake repository. Every mutating path
gets a double-fire test. Visual work is verified against `docs/screens/`, not
against memory.
