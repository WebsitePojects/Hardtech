import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Logo mark + "HardTech" / "IT CORP." wordmark, used in both the desktop/
 * mobile navbar and the mobile drawer header (docs/screens/desktop-01.md #1,
 * docs/screens/mobile-01.md #9). The source screenshots describe the mark as
 * a "diamond/circuit-board badge icon" — lucide has no literal circuit-board
 * glyph, so `Cpu` stands in as the closest available icon.
 */
export function SiteLogo({
  className,
  size = "default",
}: {
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <Link
      href="/"
      className={cn("flex shrink-0 items-center gap-2.5", className)}
    >
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden",
          size === "sm" ? "size-8" : "size-10"
        )}
      >
        <Image
          src="/images/brand/hardtech-logo.png"
          alt=""
          fill
          sizes={size === "sm" ? "32px" : "40px"}
          className="object-contain"
          aria-hidden
        />
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "font-sub font-bold text-foreground",
            size === "sm" ? "text-sm" : "text-base"
          )}
        >
          HardTech
        </span>
        <span className="font-sub text-[0.65rem] font-semibold tracking-widest text-neon uppercase">
          IT CORP.
        </span>
      </span>
    </Link>
  );
}
