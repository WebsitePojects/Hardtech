# HardTech — Design Source Analysis

Extracted from the published Figma Make site, not from screenshots.
Source: `https://slot-pear-69660733.figma.site/`
Captured: 2026-07-29

## Provenance

The site is a **Figma Make** export (`<!-- Created in Figma Make -->`).
Everything below is read out of the shipped bundle, so it is exact, not inferred.

| Artifact | Path | Size |
|---|---|---|
| App bundle | `/_components/v2/3c0a296c19f27f53200fafb104bec7ce6197f00a.js` | 1,837,607 B |
| Stylesheet | `/_components/v2/3c0a296c19f27f53200fafb104bec7ce6197f00a.css` | 52,295 B |
| Scene graph | `/_json/8417fff5-0e3e-40a4-913b-50b83838b2c9/_index.json` | 5,354 B |

`sourceCodeHash: 3c0a296c19f27f53200fafb104bec7ce6197f00a`

## Official product statement

From `siteSettings.description` in the scene graph:

> This platform offers comprehensive training in computer and cellphone hardware
> servicing and IT software development, featuring online enrollment, interactive
> dashboards, and a sleek, futuristic design.

Title: `HardTech Website`. Desktop design frame: **1280 x 1080**, vertical scroll,
`scalingMode: REFLOW`.

## Route map (20 routes)

### Dynamic routes

Found by scanning template literals and `navigate()` targets, not plain string
literals. A first pass that only greps quoted paths misses all of these.

| Route | Purpose | Next.js path |
|---|---|---|
| `/forum/:id` | Post detail | `src/app/forum/[id]/page.tsx` |
| `/forum/post/:postId` | Post detail, second entry form | `src/app/forum/post/[postId]/page.tsx` |
| `/communities/:slug` | Community detail (e.g. `iloilo-it-community`) | `src/app/communities/[slug]/page.tsx` |
| `/dashboard/:role` | Role dispatch — resolves to trainee/trainer/admin | handled by `/dashboard` redirect |

Both `/forum/:id` and `/forum/post/:postId` appear in the bundle. Confirm during
build whether these are two real routes or one plus a legacy alias; if the
latter, `/forum/post/:postId` should redirect.

Admin moderation surfaces referenced by identifier in the bundle:
`community-approval`, `forum-approval`, `moderate-community`,
`forum-leaderboard`. These are views inside `/dashboard/admin`.

### Static routes

| Route | Purpose |
|---|---|
| `/` | Home / landing |
| `/about` | About the company |
| `/programs` | Course catalogue |
| `/enroll` | Online enrollment |
| `/gallery` | Photo gallery |
| `/contact` | Contact |
| `/help` | Help centre |
| `/login` | Sign in |
| `/forgot-password` | Password recovery |
| `/forum` | Community forum |
| `/forum/leaderboard` | Rating leaderboard |
| `/communities` | Region-scoped community directory |
| `/dashboard` | Role router |
| `/dashboard/trainee` | Trainee dashboard |
| `/dashboard/trainer` | Trainer dashboard |
| `/dashboard/admin` | Admin dashboard |

**Three roles: `trainee`, `trainer`, `admin`.** Screenshots also show an
`ADMIN` / `ACTIVE` badge pair and a "Trainee posts require approval" rule,
so moderation state is a real part of the model.

## Libraries present in the bundle

| Library | Reference count | Role |
|---|---|---|
| `sonner` | 127 | Toasts |
| `lucide` | 116 | Icon set |
| `recharts` | 104 | Dashboard charts |
| `react-router` | 5 | Client routing |
| `vaul` | 1 | Drawer (mobile sheets) |

This is the stock **shadcn/ui** dependency set. Combined with the oklch token
names (`--sidebar-*`, `--chart-1..5`, `--radius: .625rem`) and Tailwind v4 theme
vars (`--container-*`, `--text-*--line-height`, `--spacing`), the source is
React + Vite + Tailwind v4 + shadcn/ui. Rebuilding on shadcn/ui reproduces the
component geometry exactly rather than approximating it.

## Design tokens

### Brand — neon green

| Token | Light | Dark |
|---|---|---|
| `--neon` | `#16a34a` | `#4ade80` |
| `--neon-light` | `#22c55e` | `#86efac` |
| `--neon-dark` | `#15803d` | `#22c55e` |
| `--neon-glow` | `#16a34a1f` | `#4ade801f` |
| `--neon-glow-soft` | `#16a34a0d` | `#4ade800a` |

`--primary: var(--neon)`, `--primary-light: var(--neon-light)`,
`--primary-dark: var(--neon-dark)`.

### Surfaces

| Token | Light | Dark |
|---|---|---|
| `--bg-main` | `#fff` | `#080d12` |
| `--bg-secondary` | `#f8f9fa` | `#0f1419` |
| `--bg-card` | `#ffffffe6` | `#141a22b3` |
| `--glass-bg` | `#fffc` | `#141a228c` |
| `--glass-border` | `#00000014` | `#ffffff12` |
| `--glass-hover` | `#fff` | `#ffffff0a` |

The dark surface ramp `#080d12 → #0f1419 → #141a22` plus the translucent
`--glass-*` set is what produces the floating navbar in the screenshots.

### Text

| Token | Light | Dark |
|---|---|---|
| `--text-primary` | `#1a1a1a` | — |
| `--text-secondary` | `#4a5568` | — |
| `--text-muted` | `#718096` | `#8a95a3` |

### Secondary accents

| Token | Light | Dark |
|---|---|---|
| `--accent-blue` | `#3b82f6` | `#60a5fa` |
| `--accent-purple` | `#8b5cf6` | `#a78bfa` |
| `--accent-orange` | `#f59e0b` | `#fbbf24` |

Each has a `-light` and a `-glow` variant. These drive the coloured community
cards and the category badges.

### Glow and elevation

```
--glow-sm : 0 0 0 3px #16a34a1f   /  0 0 0 3px #4ade801a
--glow-md : 0 0 20px #16a34a26    /  0 0 24px #4ade801f
--glow-lg : 0 0 40px #16a34a33    /  0 0 48px #4ade8026

--shadow-sm (dark) : 0 1px 3px #00000080
--shadow-md (dark) : 0 4px 20px #0009
--shadow-lg (dark) : 0 16px 52px #000000b3

--hero-glow-core      : #16a34a29 / #4ade801f
--hero-glow-primary   : #16a34a42 / #4ade802e
--hero-glow-secondary : #16a34a14 / #60a5fa1a
--dashboard-glow      : radial-gradient(ellipse, #16a34a24 0%, transparent 70%)
--code-bg-color       : #16a34a1c / #4ade8024
```

### Typography

The design system declares three families:

```
--font-title : "Teachers", serif
--font-sub   : "Manrope", sans-serif
--font-body  : "Inter", sans-serif
```

The published runtime substitutes **Source Sans 3** because Figma Sites only
shipped that face. Intent is Teachers / Manrope / Inter — all on Google Fonts.

Type scale is Tailwind v4 default (`--text-base: 1rem/1.5`, `--text-3xl:
1.875rem/1.2`, up to `--text-9xl: 8rem/1`).

### Geometry

`--radius: .625rem` (shadcn default), `--radius-2xl: 1rem`, `--radius-3xl: 1.5rem`,
`--spacing: .25rem`.

## Real-world data found in the bundle

Not placeholder content — these are live company details and must be preserved:

- Intended API base: `https://api.hardtech.edu.ph`
- Branch: `673 Quirino Highway, Novaliches, Quezon City`
- Branch: `Batasan Road, Quezon City, Metro Manila`
- Staff Facebook profiles: `henry.gomata.lopez`, `arl.mazz`, `Dongdylan`,
  `jamfu199`, `profile.php?id=61577279713121`

## Assets

Only one remote raster asset is referenced:

```
https://images.unsplash.com/photo-1767448068187-5be3cbc848c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=80
```

Everything else is lucide SVG, emoji, or pure CSS gradient. Asset scraping is
therefore a small job, not a blocker.

## Screenshot corpus

| Set | Location | Count |
|---|---|---|
| Desktop (loose) | `D:\Win10_UserData\Downloads\Hardtech\Desktop\*.png` | 4 |
| Desktop (in `HardTech.zip`) | nested inside `drive-download-…-001.zip` | 59 |
| Mobile | `D:\Win10_UserData\Downloads\Hardtech\Mobile\*.jpg` | 209 |

**272 screenshots total.** These are the behavioural spec (states, empty states,
modals, validation) that the static bundle analysis cannot supply on its own.

## Confirmed UI surfaces (from desktop screenshots)

Forum shell: floating glass navbar (logo + Home / About / Forum / Explore▾ +
notification bell with count + role chip), left rail (Categories with per-category
counts, Guidelines 1-5, Forum Stats), centre column (search, sort, tab group
All Posts / Trending / Communities / Bookmarks, active filter chips with clear-all),
right rail (Trending 1-5, My Bookmarks, Rating Leaderboard with medal ranks and
star scores).

Forum categories: General Discussion, Q&A Help, Resources & Tips, Troubleshooting,
Career & Jobs, Announcements.

Communities are region-scoped with geolocation ("DETECTED REGION — NCR / Metro
Manila", Change region): Quezon City Repair Hub, Cavite Technicians, Cebu Techs
Network, Davao Tech Circle, Laguna Tech Collective, Pampanga Repair Pros,
Batangas Tech Hub, Iloilo IT Community, NCR / Metro Manila Technicians.

Community topic tags: Mobile Repair, Desktop Repair, Networking, Troubleshooting.

Post card carries: author avatar, role badge, status badge, author star rating with
count, post count, age, category chip, title, excerpt, hashtags, upvote count,
helpful count, insight marker, view count, reply count, bookmark, report.
Pinned and Trending are separate flags.
