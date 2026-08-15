/**
 * The vgldesign three-curve easing system. Every animation in this codebase
 * names one of these — do not invent a fourth curve or a bespoke duration
 * outside the ranges documented alongside each export.
 *
 * See ~/.claude/skills/vgldesign/SKILL.md for the full rationale. Numeric
 * arrays are the cubic-bezier control points, usable directly as Framer
 * Motion `ease` tuples or GSAP `ease` strings via `EASE_*_CSS`.
 */

/** Hovers, buttons, small state changes. 150-300ms. Tailwind's stock ease-in-out. */
export const EASE_UI = [0.4, 0, 0.2, 1] as const;

/** Scroll entrances (IntersectionObserver reveals, footer, cards). */
export const EASE_REVEAL = [0.22, 1, 0.36, 1] as const;

/** Hero + curtain only, sparingly. Never on routine UI. */
export const EASE_DRAMA = [0.77, 0, 0.175, 1] as const;

/** CSS `cubic-bezier(...)` string forms, for use in stylesheets/keyframes. */
export const EASE_UI_CSS = `cubic-bezier(${EASE_UI.join(",")})`;
export const EASE_REVEAL_CSS = `cubic-bezier(${EASE_REVEAL.join(",")})`;
export const EASE_DRAMA_CSS = `cubic-bezier(${EASE_DRAMA.join(",")})`;

/** The measured scroll-reveal pre-trigger offset (vgldesign technique #1). */
export const REVEAL_OFFSET_PX = 48;
