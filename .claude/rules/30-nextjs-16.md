# Next.js 16 — what changed since your training data

This project runs **Next.js 16.2.12 / React 19.2.4**. Next ships its own warning
about this in `AGENTS.md`, and it is correct: patterns you remember from Next 14
and 15 will silently produce broken code here.

Full reference is bundled locally at `node_modules/next/dist/docs/`. The upgrade
notes are `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.
**Read the relevant page before writing code in an unfamiliar area** rather than
working from memory.

The items below are the ones this codebase actually hits.

## 1. Request APIs are async-only (hard breaking)

Next 15 allowed synchronous access with a deprecation warning. Next 16 removed
it. These are **only** available as Promises:

`cookies()`, `headers()`, `draftMode()`, `params`, `searchParams`

```tsx
// WRONG — this is the Next 15 pattern, it fails here
export default function Page({ params }: { params: { id: string } }) {
  return <Post id={params.id} />
}

// RIGHT
export default async function Page(props: PageProps<'/forum/[id]'>) {
  const { id } = await props.params
  return <Post id={id} />
}
```

This affects every dynamic route we have: `/forum/[id]`, `/forum/post/[postId]`,
`/communities/[slug]`.

Run `npx next typegen` to generate the `PageProps<'/route'>`, `LayoutProps`, and
`RouteContext` global helpers. Use them instead of hand-writing prop types — they
give type-safe params per route.

## 2. `middleware.ts` is now `proxy.ts`

The file, the named export, and the config flags all renamed. Role-gating for
`/dashboard/*` goes here.

```ts
// proxy.ts  (NOT middleware.ts)
export function proxy(request: Request) {}
```

The `edge` runtime is **not supported** in `proxy` — it runs on `nodejs` and that
is not configurable. Config flags renamed too: `skipMiddlewareUrlNormalize` is now
`skipProxyUrlNormalize`.

## 3. Cache APIs

`revalidateTag` now takes a **second required argument**, a `cacheLife` profile.
The one-argument form is a TypeScript error.

```ts
revalidateTag('posts')          // WRONG — TS error
revalidateTag('posts', 'max')   // RIGHT
```

`updateTag(tag)` is new, Server-Actions-only, and gives **read-your-writes**:
the user immediately sees their own change instead of stale data. Use it for
forum post creation, replies, votes, bookmarks, and enrollment submission —
anywhere the user must see their own mutation land. Use `revalidateTag` only
where a delay is acceptable (program catalogue, gallery).

`refresh()` from `next/cache` refreshes the client router from a Server Action —
use it for the notification count in the navbar.

`cacheLife` and `cacheTag` are stable; drop any `unstable_` prefix.

## 4. Turbopack is the default

Both `next dev` and `next build` use Turbopack with no flag. Do not add
`--turbopack`. A custom `webpack` config now **fails the build** unless you pass
`--webpack` explicitly. Don't introduce one.

`next dev` outputs to `.next/dev`, separate from `next build`, so both can run
concurrently.

## 5. `next lint` is removed

`next build` no longer lints. Lint is a separate step: `npm run lint` runs
`eslint` directly. The `eslint` key in `next.config` is gone. CI must run lint as
its own command — a green build says nothing about lint.

## 6. `next/image`

- `images.qualities` defaults to `[75]` only. Any other `quality` prop is coerced
  to the nearest allowed value. Add the value to config if you need it.
- `images.domains` is deprecated — use `images.remotePatterns`. We need this for
  the one Unsplash asset in the design.
- `minimumCacheTTL` default is now 4 hours, not 60 seconds.
- `maximumRedirects` defaults to 3.
- Local images with query strings require `images.localPatterns.search`.
- `next/legacy/image` is deprecated.

## 7. Smooth scroll

Next no longer overrides `scroll-behavior` during navigation. If we set
`scroll-behavior: smooth` globally, add `data-scroll-behavior="smooth"` to
`<html>` in the root layout, or route transitions will animate instead of
jumping.

## 8. Removed outright

- `serverRuntimeConfig` / `publicRuntimeConfig` — use env vars. Server-only values
  read directly in Server Components; client values need the `NEXT_PUBLIC_` prefix.
  Wrap in `await connection()` first if the value must be read at runtime rather
  than baked in at build time.
- AMP, `next/amp`, `useAmp`.
- `experimental.dynamicIO`, `experimental.useCache` → top-level `cacheComponents`.
- `experimental_ppr` route segment config → `cacheComponents`.
- `unstable_rootParams`.

## 9. Parallel routes

Every parallel route slot now requires an explicit `default.js`. The build fails
without one. If we use a modal slot for post detail, it needs
`app/@modal/default.tsx` returning `null` or calling `notFound()`.

## 10. Environment floor

Node 20.9+, TypeScript 5.1+, Chrome/Edge/Firefox 111+, Safari 16.4+.
This machine runs Node 24.14.1 — fine.
