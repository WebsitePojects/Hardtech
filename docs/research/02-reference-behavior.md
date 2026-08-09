# Reference behaviour spec — measured, not inferred

Source: the live published design at `https://slot-pear-69660733.figma.site/`,
driven with Playwright at 1440x900 and read via `getComputedStyle`.

Every number here was **read off the running reference**, not estimated from a
screenshot. Where this file and a screenshot disagree, this file wins — a
screenshot cannot show a transition curve or a scroll threshold.

Re-measure with the scripts in the scratchpad (`ref-header2.mjs`, `ref-drop2.mjs`)
rather than trusting a stale copy of this document.

---

## 1. Navbar — it emerges on scroll

This is the single largest behavioural gap in our build. The reference navbar is
**flat and full-bleed at the top of the page** and **condenses into a floating
glass pill once scrolled**. Ours renders the pill permanently, so the effect
never happens.

### Structure

```
DIV.fixed top-0 left-0 right-0 px-3 sm:px-4      ← wrapper, z-index 100000
  NAV.mx-auto relative                            ← the shell that becomes the pill
    DIV.px-4 sm:px-6 lg:px-7
      DIV.flex items-center justify-between h-[68px]
```

### Wrapper — `DIV.fixed top-0 left-0 right-0`

| Property | At top | Scrolled |
|---|---|---|
| `padding` | `0px` | `10px 16px 0px` |
| `height` | `70px` | `80px` |
| `z-index` | `100000` | `100000` |

`transition: padding 0.6s cubic-bezier(0.4, 0, 0.2, 1)`

### Shell — `NAV.mx-auto relative`

| Property | At top | Scrolled |
|---|---|---|
| `backdrop-filter` | `none` | `blur(28px) saturate(1.6)` |
| `border-radius` | `0px` | `22px` |
| `border-color` | `rgba(0, 0, 0, 0)` | `rgba(255, 255, 255, 0.08)` |
| `background-color` | `rgba(0, 0, 0, 0)` | `rgba(0, 0, 0, 0)` — stays transparent |
| `box-shadow` | `none` | four layers, below |

```
box-shadow:
  rgba(0, 0, 0, 0.55)      0px 24px 64px 0px,
  rgba(0, 0, 0, 0.35)      0px  8px 24px 0px,
  rgba(255, 255, 255, 0.1) 0px  1px  0px 0px inset,
  rgba(0, 0, 0, 0.25)      0px -1px  0px 0px inset;
```

`transition: 0.6s cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 0.5s ease-out`

Note the background stays fully transparent in both states. The panel reads as
dark glass purely from `backdrop-filter` over the dark page beneath it. Do not
add a background tint to fake it — that is why the reference looks like glass
and a tinted copy looks like plastic.

The two inset shadow layers are what give the pill its lit top edge and grounded
bottom edge. They are not decoration; drop them and the shape goes flat.

### What ours does instead

Measured on `http://localhost:3000/` at the same viewport:

```
DIV.sticky top-4 z-50            ← should be fixed top-0, z-index 100000
  HEADER.glass  … rounded-full   ← pill is permanent; should be square at top
    background-color: rgba(20, 26, 34, 0.55)   ← should be transparent
    transition: box-shadow 0.15s               ← should be 0.6s cubic-bezier
    (no change whatsoever on scroll)
```

---

## 2. Dropdown panels — Explore, and the forum sort menu

### Panel shell

```
DIV.absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden
```

| Property | Value |
|---|---|
| `background-color` | `rgb(6, 10, 16)` — opaque, darker than page |
| `border` | `1px solid rgba(74, 222, 128, 0.12)` |
| `border-radius` | `16px` |
| `z-index` | `999999` |
| measured box | `256 x 260` for the four-item Explore menu |

```
box-shadow:
  rgba(0, 0, 0, 0.7)        0px  8px 16px 0px,
  rgba(0, 0, 0, 0.9)        0px 24px 72px 0px,
  rgba(74, 222, 128, 0.04)  0px  0px  0px 0.5px inset;
```

The border and the inset hairline are both **green-tinted** — `rgba(74, 222, 128, …)`
is the `--neon` dark value. A neutral white or grey border is wrong.

Unlike the navbar the panel is **opaque**, not blurred. Do not give it
`backdrop-filter`.

### Menus that need this treatment

- **Explore** in the navbar → Programs / Gallery / Contact & Location / User Guide,
  each a title with a muted subtitle beneath and a leading icon tile.
- **Forum sort** → Newest / Most Active / Most Viewed / Most Reactions, with a
  check mark against the active option and the trigger label reflecting it.

Both are visible in the reference captures under
`D:/Win10_UserData/Downloads/Hardtech/Desktop/`.

---

## 3. Page surface texture — the "semi-matte with grain" look

This is a global miss, not a per-page one. Our build paints flat surfaces; the
reference layers four translucent passes over every page. Together they are what
make it read as semi-matte rather than solid.

All of it hangs off a root element carrying `cyber-bg`, measured on the
reference's `/login`:

```css
/* the grain — a 1px dot matrix on a 28px grid at 3.5% white */
.cyber-bg::after {
  background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, rgba(0,0,0,0) 1px);
  background-size: 28px 28px;
}

/* a soft green bloom hanging from the top edge */
.cyber-bg::before {
  background-image: radial-gradient(80% 60% at 50% -5%, rgba(74,222,128,0.04), rgba(0,0,0,0) 65%);
}
```

On `/login` specifically, two further layers sit above that:

```css
/* the visible 48px technical grid */
.grid-overlay {                      /* .absolute.inset-0.pointer-events-none */
  background-image:
    linear-gradient(rgba(0,255,136,0.03) 1px, rgba(0,0,0,0) 1px),
    linear-gradient(90deg, rgba(0,255,136,0.03) 1px, rgba(0,0,0,0) 1px);
  background-size: 48px 48px, 48px 48px;
}

/* two soft orbs, .absolute.rounded-full.pointer-events-none */
radial-gradient(circle, rgba(0,255,136,0.06) 0%, rgba(0,0,0,0) 70%)
radial-gradient(circle, rgba(0,255,136,0.05) 0%, rgba(0,0,0,0) 70%)
```

Ours currently has only a `hero-glow` radial and none of the above.

Two notes before implementing:

- The alphas are tiny on purpose — `0.035`, `0.04`, `0.03`. At those values the
  effect is felt, not seen. Rounding them up to something "visible" is the
  fastest way to make the page look cheap.
- `rgba(0,255,136,…)` is a more saturated green than `--neon` (`#4ade80`), and
  the reference hardcodes it rather than using its own variable. It needs its
  own token; do not silently substitute `--neon` and do not paste a raw hex into
  a component.

Every overlay must be `pointer-events-none`, and none of it may appear in the
accessibility tree.

## 4. Method — how to add to this file

```js
// measure any element across a state change
const before = await snap();
await p.evaluate(() => window.scrollTo(0, 700));
await p.waitForTimeout(1600);
const after = await snap();
// diff every computed property, print only what changed
```

Walk **up the ancestor chain**. The element holding the visible treatment is
usually two or three levels above the one whose text you matched on — a naive
text match lands on an inner flex row with `position: static` and no styling,
which is exactly the trap that produced a first round of wrong measurements
here.

---

## 4. Related build defect found while measuring

`.glass` shipped **without its blur** for the entire project history.

Lightning CSS, which Turbopack runs over Tailwind v4, prunes a bare
`backdrop-filter` (and its `-webkit-` twin) against its default browser targets.
It does this silently: the rule still ships, minus those two declarations. The
served CSS read

```css
.glass { background-color: …; border: …; box-shadow: … }
```

while `.backdrop-blur-md` on the same page computed to `blur(12px)` — Tailwind
emits its own backdrop utilities inside an `@supports` guard, which is what
protects them.

Fixed in `src/app/globals.css` by wrapping the declaration in the same guard.
See the comment there.
