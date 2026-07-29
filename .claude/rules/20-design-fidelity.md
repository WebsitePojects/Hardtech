# Design fidelity

Target: **1:1 with the published Figma Make design.** Ground truth lives in
`docs/research/01-design-source.md` (tokens, routes, libraries) and
`docs/screens/` (per-screenshot specifications).

## Do not invent

- **Colour.** Every colour comes from a token in the extracted set. If a value
  is not in `01-design-source.md`, it is not in the design — go look again
  rather than picking something close.
- **Copy.** Headings, labels, button text, placeholders, empty states, and
  helper text are transcribed from the screenshots. Do not paraphrase, do not
  "improve" wording, do not fix the source's capitalization.
- **Structure.** Column counts, rail placement, and card composition are
  specified. Match them.

## Token set

Brand green ramp `--neon` (`#16a34a` light / `#4ade80` dark) drives `--primary`.
Dark surfaces step `#080d12 → #0f1419 → #141a22`. The floating navbar and cards
use the `--glass-*` translucent set with `--glass-border` hairlines. Glow is a
real part of this design: `--glow-sm/md/lg`, `--hero-glow-*`, `--dashboard-glow`.
Secondary accents blue / purple / orange each have `-light` and `-glow` variants
and drive community cards and category badges.

Radius is `.625rem` (shadcn default). Type is Teachers (titles) / Manrope (subs)
/ Inter (body); the published site substitutes Source Sans 3 only because Figma
Sites lacked the faces — use the declared intent.

## Dark mode is the primary theme

Every screenshot is dark. Light tokens exist in the source and are ported, but
dark is what gets verified.

## Verification

A route is not done because it renders. It is done when it has been compared
side by side against its screenshots in `docs/screens/` and the specific deltas
— spacing, weight, radius, colour, gap — are either zero or written down as
known and accepted. "Looks right" is not a verification.
