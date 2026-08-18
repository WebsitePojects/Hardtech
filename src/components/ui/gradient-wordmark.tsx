import { cn } from "@/lib/utils";

type GradientWordmarkProps = {
  /** The word to render, e.g. "HARDTECH". Meant for a single short brand
   * word — see the sizing comment below for the assumption the `clamp()`
   * math leans on, and why arbitrarily long text still can't break layout
   * even if that assumption doesn't hold. */
  text: string;
  className?: string;
};

/**
 * Oversized, decorative closing wordmark: a brand-tinted top-to-bottom
 * gradient fill that fades to fully transparent, plus a horizontal mask so
 * the word fades out at its own edges instead of hard-clipping. Extracted
 * from the inline version in `src/components/layout/footer.tsx` (read for
 * reference, not modified here — swapping the footer to this component is a
 * later wave) into a token-driven, reusable primitive.
 *
 * Sizing uses `clamp(min, preferred-vw, max)` instead of the footer's
 * stepped breakpoints (`text-[19vw] sm:text-[15vw] md:text-[12vw]
 * lg:text-[9vw]`) so it scales continuously from 320px to 2560px with no
 * jump at a breakpoint edge.
 *
 * Overflow check for the max clamp value (16rem = 256px, reached once the
 * viewport is wide enough that 18vw already exceeds it, i.e. ~1422px+): an
 * all-caps condensed wordmark averages roughly 0.6em of ink per glyph, so an
 * 8-9 character brand word resolves to roughly 9 * 0.6 * 256px ~= 1382px —
 * comfortably inside any viewport that reaches the max in the first place.
 * Below that width the font tracks 18vw directly, so ink width stays
 * proportional to (and under) the viewport width throughout. `overflow-hidden`
 * on this element's own box is the backstop for text longer than that
 * assumption, or a narrower parent than the viewport: `nowrap` ink that
 * extends past its own box still contributes to the page's scrollable
 * overflow unless the box itself clips it — width is separately capped at
 * the parent via `w-full max-w-full`, so the box can never grow past its
 * container regardless of what the resolved font size is.
 *
 * Purely typographic decoration: `aria-hidden` and `select-none` keep it out
 * of the accessible tree and text selection, `pointer-events-none` keeps it
 * from intercepting a click meant for whatever sits behind or after it. It
 * has no motion of its own — a scroll reveal wrapping it (as the footer
 * does) is the consumer's choice, not this component's.
 */
function GradientWordmark({ text, className }: GradientWordmarkProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none block w-full max-w-full overflow-hidden text-center leading-[0.8] font-bold tracking-tighter text-transparent select-none",
        "font-title bg-gradient-to-b from-primary/25 via-primary/8 to-transparent bg-clip-text",
        className,
      )}
      style={{
        fontSize: "clamp(3rem, 18vw, 16rem)",
        // A CSS mask reads only the alpha/luminance channel of its image —
        // the hue is irrelevant, so `black`/`transparent` here are opacity
        // stops, not a paint colour standing in for a token. The visible
        // colour comes entirely from the `bg-clip-text` gradient above,
        // which is token-driven (`from-primary/25` etc.).
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        maskImage:
          "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}
    >
      {text}
    </span>
  );
}

export { GradientWordmark };
export type { GradientWordmarkProps };
