"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { EASE_UI_CSS } from "@/components/motion/easing";

export type FluidTabItem<TValue extends string = string> = {
  value: TValue;
  label: string;
};

/**
 * Link-mode tab: carries its own already-resolved `href` instead of a
 * `buildHref` callback. A function cannot cross the Server→Client boundary
 * (see the module doc below), so the href has to be plain, serializable data
 * by the time it reaches this "use client" component.
 */
export type FluidLinkTabItem<TValue extends string = string> = FluidTabItem<TValue> & {
  href: string;
};

type FluidTabsShared<TValue extends string> = {
  active: TValue;
  className?: string;
};

/**
 * Server-derived active state: tabs are `next/link`s and the URL owns which
 * one is active — mirrors `src/features/forum/forum-tabs.tsx`, so a shared
 * link stays shareable/bookmarkable and survives a full reload. Each tab
 * carries its own resolved `href`; the caller (a Server Component) computes
 * it before handing tabs down, rather than passing a `buildHref` function for
 * this component to call.
 */
type FluidTabsLinkProps<TValue extends string> = FluidTabsShared<TValue> & {
  mode: "link";
  tabs: FluidLinkTabItem<TValue>[];
};

/** Client-owned active state: tabs are buttons, the parent holds the value. */
type FluidTabsButtonProps<TValue extends string> = FluidTabsShared<TValue> & {
  mode: "button";
  tabs: FluidTabItem<TValue>[];
  onValueChange: (value: TValue) => void;
};

/**
 * `TValue` defaults to `string` so a consumer that does not care about
 * literal tab values (or passes them inline without a named union) needs no
 * explicit type argument — this generalisation is additive, not breaking.
 */
export type FluidTabsProps<TValue extends string = string> =
  | FluidTabsLinkProps<TValue>
  | FluidTabsButtonProps<TValue>;

type IndicatorRect = { left: number; width: number };

/**
 * Sliding-pill tab strip. An absolutely-positioned indicator is measured off
 * the active tab's `offsetLeft`/`offsetWidth` and driven with
 * `transform`/`width` (not `left`/layout), so the browser can composite the
 * move.
 *
 * SSR / no-JS / reduced-motion: `indicator` starts `null`, so the pill is
 * hidden (opacity 0, not parked at position 0) until the first client
 * measurement. The active tab's own `text-primary` styling below does not
 * depend on the indicator at all, so which tab is active is still legible
 * with no JS and no layout pass.
 *
 * Generic over `TValue` (see `FluidTabsProps` doc) purely at the type level —
 * `tabRefs` below is keyed by `TValue` directly, so the generalisation does
 * not push a cast into the component's own body; it only removes one at the
 * consumer boundary. Declared as a `function`, not an arrow, so the type
 * parameter needs no disambiguating trailing comma in this `.tsx` file —
 * that pitfall only applies to `const f = <T,>() => {}` generic arrows,
 * where the parser would otherwise read `<T>` as a JSX tag.
 */
export function FluidTabs<TValue extends string = string>(
  props: FluidTabsProps<TValue>,
) {
  const { active, className } = props;

  // This row is the *scrolling content*, not the overflow-x clipper around
  // it. Its width is intrinsic (`w-max`, sized to the sum of tab widths), so
  // a font swap or a longer label resizes THIS element — which is exactly
  // what the ResizeObserver below needs. Observing the clipper instead would
  // miss that: the clipper's width comes from the layout slot it sits in,
  // not from its children, so content-driven changes would never fire it.
  //
  // The indicator lives inside this same row, so it scrolls with the tabs
  // under native browser scrolling — no scroll listener needed to keep it
  // locked to its tab.
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<TValue, HTMLElement>());
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);

  const measure = useCallback(() => {
    const activeEl = tabRefs.current.get(active);
    if (!activeEl) return;
    setIndicator({ left: activeEl.offsetLeft, width: activeEl.offsetWidth });
  }, [active]);

  // Synchronous so the corrected rect lands in the first client paint —
  // useEffect would paint one frame at the stale (or absent) rect first.
  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    // Belt-and-suspenders per spec: an orientation change can alter
    // available width without the row's own content ever resizing.
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const registerTab = (value: TValue) => (el: HTMLElement | null) => {
    if (el) tabRefs.current.set(value, el);
    else tabRefs.current.delete(value);
  };

  // Roving tabindex + arrow-key navigation, button mode only. Link-mode tabs
  // are plain anchors and already get correct Tab/Enter behaviour natively.
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (props.mode !== "button") return;
    const buttonTabs = props.tabs;
    const currentIndex = buttonTabs.findIndex((tab) => tab.value === active);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % buttonTabs.length;
        break;
      case "ArrowLeft":
        nextIndex = (currentIndex - 1 + buttonTabs.length) % buttonTabs.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = buttonTabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextTab = buttonTabs[nextIndex];
    tabRefs.current.get(nextTab.value)?.focus();
    props.onValueChange(nextTab.value);
  };

  // Active styling is independent of the indicator on purpose (see module
  // doc): this is what SSR, no-JS, and reduced-motion sessions rely on to
  // show the active tab.
  //
  // min-h-11/sm:min-h-7 reconciles two constraints that pull in opposite
  // directions: the 44px tap-target floor (rule #7) only matters where taps
  // happen — touch/mobile widths — while `.claude/rules/20-design-fidelity.md`
  // requires reproducing the reference strip's tighter desktop geometry
  // exactly. `sm:min-h-7` (1.75rem/28px) reproduces `forum-tabs.tsx`'s actual
  // rendered height at that breakpoint: `py-1.5` (12px) + `text-xs`'s 1rem
  // line-height (16px) = 28px, so this isn't a guessed value.
  //
  // Shared by both mode branches below (link renders `<Link>`, button renders
  // `<button>`) so the geometry/typography stays in exactly one place even
  // though the two branches can't share a single `.map` — `props.tabs`'
  // element type differs per mode (link items carry `href`, button items
  // don't) and narrowing `props.mode` doesn't narrow a value already
  // destructured out of `props` before the check.
  const tabClassName = (isActive: boolean) =>
    cn(
      "relative z-10 flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:min-h-7",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <div
      role="tablist"
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-glass-border bg-glass p-1 [scrollbar-width:none]",
        className,
      )}
      onKeyDown={handleKeyDown}
    >
      <div ref={rowRef} className="relative flex w-max gap-1">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 rounded-lg bg-primary/15 shadow-glow-sm",
            "transition-[transform,width] duration-200",
            // Reduced motion: reposition instantly, still visible — this is
            // the only branch that disables the transition, never visibility.
            "motion-reduce:transition-none motion-reduce:duration-0",
          )}
          // Inline style, not a Tailwind arbitrary-value utility class: a
          // class name dynamically composed from `EASE_UI_CSS` isn't
          // statically extractable by Tailwind's scanner and has silently
          // computed to nothing in this codebase before (.claude/lessons.md,
          // 2026-08-09, "A four-layer Tailwind arbitrary shadow computed to
          // nothing"). Setting `transitionTimingFunction` directly needs no
          // "read the computed style to confirm it survived" step. Same
          // technique as `src/components/ui/morphing-button.tsx` — do not
          // reintroduce an arbitrary-value utility class here.
          style={{
            transitionTimingFunction: EASE_UI_CSS,
            transform: `translateX(${indicator?.left ?? 0}px)`,
            width: indicator ? `${indicator.width}px` : 0,
            opacity: indicator ? 1 : 0,
          }}
        />

        {props.mode === "link"
          ? props.tabs.map((tab) => {
              const isActive = tab.value === active;
              return (
                <Link
                  key={tab.value}
                  ref={registerTab(tab.value)}
                  href={tab.href}
                  role="tab"
                  aria-selected={isActive}
                  className={tabClassName(isActive)}
                >
                  {tab.label}
                </Link>
              );
            })
          : props.tabs.map((tab) => {
              const isActive = tab.value === active;
              return (
                <button
                  key={tab.value}
                  ref={registerTab(tab.value)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => props.onValueChange(tab.value)}
                  className={tabClassName(isActive)}
                >
                  {tab.label}
                </button>
              );
            })}
      </div>
    </div>
  );
}
