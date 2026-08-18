"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * App-wide z-index scale. Every stacking value in the layout/home tree
 * follows from this list — do not invent a new number ad hoc; place it here
 * first and reference this comment from the component that uses it.
 *
 *   999999  DesktopNav "Explore" mega-menu (desktop-nav.tsx). A menu attached
 *           to the navbar must render above the navbar itself.
 *   100000  This fixed navbar shell. Always above ordinary page content AND
 *           above the mobile Sheet drawer overlay (radix default z-50, see
 *           components/ui/sheet.tsx), so the persistent header — including
 *           its logo — stays visible and interactive while the drawer is
 *           open. That is also why the drawer must not render its own copy
 *           of the logo: this bar's logo is the single visible instance,
 *           full stop (see mobile-nav.tsx).
 *      50   Mobile Sheet drawer overlay + content (shadcn default, unowned).
 *      30   Floating decorative page-level cards, e.g. the home hero's Live
 *           Updates announcement card (announcements-card.tsx). Above page
 *           content/glow, below all navigation chrome.
 *    auto   Ordinary in-flow page content.
 *
 * The navbar's scroll behaviour.
 *
 * At the top of the page the bar is flat and full-bleed. Once scrolled it
 * condenses into a floating glass pill. Both states and the transition between
 * them were measured off the live reference with getComputedStyle — see
 * docs/research/02-reference-behavior.md for the raw numbers.
 *
 * Three details are load-bearing and easy to lose:
 *
 *   1. The shell's background stays fully transparent in BOTH states. The panel
 *      reads as dark glass purely from backdrop-filter over the dark page
 *      beneath it. Tinting the background to approximate the effect is what
 *      makes a clone read as plastic instead of glass.
 *
 *   2. All four box-shadow layers matter. The two inset layers give the pill a
 *      lit top edge and a grounded bottom edge; collapsing them flattens it.
 *
 *   3. The blur is applied with Tailwind's backdrop utilities rather than a
 *      bare `backdrop-filter` declaration. Lightning CSS silently prunes the
 *      bare form against its default targets — that bug shipped `.glass`
 *      without any blur for the whole project history. Tailwind emits its
 *      backdrop utilities inside an `@supports` guard, which survives.
 *
 * This is the only client component in the navbar tree that exists purely for
 * presentation; the interactive children (`DesktopNav`, `MobileNav`) are passed
 * straight through as already-rendered nodes so the server parts stay on the
 * server.
 */
export function NavbarShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    // Read once on mount so a page restored mid-scroll starts in the right
    // state instead of flat-then-popping on the first wheel event.
    const read = () => {
      const scrollY = window.scrollY;
      const delta = scrollY - lastScrollY.current;

      setScrolled(scrollY > 8);
      if (scrollY <= 24 || delta < -6) setHidden(false);
      else if (scrollY > 112 && delta > 6) setHidden(true);

      lastScrollY.current = scrollY;
      frame.current = null;
    };

    lastScrollY.current = window.scrollY;
    read();

    const onScroll = () => {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <div
      data-scrolled={scrolled}
      data-hidden={hidden}
      className="navbar-shell fixed inset-x-0 top-0 z-[100000] px-0 pt-0 transition-[padding,transform,opacity,visibility] duration-[500ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[scrolled=true]:px-4 data-[scrolled=true]:pt-[10px] data-[hidden=true]:invisible data-[hidden=true]:-translate-y-[calc(100%+1rem)] data-[hidden=true]:opacity-0 data-[hidden=true]:pointer-events-none"
    >
      <nav
        data-scrolled={scrolled}
        className="navbar-pill relative mx-auto w-full max-w-[1120px] border border-transparent bg-transparent transition-[border-radius,border-color,box-shadow,backdrop-filter] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[scrolled=true]:rounded-[22px] data-[scrolled=true]:border-white/[0.08] data-[scrolled=true]:backdrop-blur-[28px] data-[scrolled=true]:backdrop-saturate-[1.6]"
      >
        <div className="px-4 sm:px-6 lg:px-7">
          <div className="flex h-[68px] items-center justify-between gap-3">{children}</div>
        </div>
      </nav>
    </div>
  );
}
