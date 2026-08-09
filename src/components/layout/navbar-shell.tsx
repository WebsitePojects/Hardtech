"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
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

  useEffect(() => {
    // Read once on mount so a page restored mid-scroll starts in the right
    // state instead of flat-then-popping on the first wheel event.
    const read = () => setScrolled(window.scrollY > 8);
    read();
    window.addEventListener("scroll", read, { passive: true });
    return () => window.removeEventListener("scroll", read);
  }, []);

  return (
    <div
      data-scrolled={scrolled}
      className="fixed inset-x-0 top-0 z-[100000] px-0 pt-0 transition-[padding] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none data-[scrolled=true]:px-4 data-[scrolled=true]:pt-[10px]"
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
