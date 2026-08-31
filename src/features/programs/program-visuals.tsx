// Token-based visual resolution for a Program row. `Program.accentColor` and
// `Program.iconName` are free-text columns seeded by DATA, so both resolvers
// fail closed to a known-good brand default rather than rendering raw,
// unvalidated input or crashing on an unrecognized value.
//
// `renderProgramIcon` returns JSX directly (one static tag per switch
// branch) rather than returning a component reference for the caller to
// render as `<Icon />`. The latter pattern trips the React Compiler's
// `react-hooks/static-components` check ("Cannot create components during
// render") because a component picked by a function call isn't statically
// provable to be stable across renders, even though this lookup is a pure,
// deterministic table.
import { Cpu, GraduationCap, Smartphone } from "lucide-react";

export interface AccentTokens {
  /** Text color utility, e.g. for the icon glyph and price. */
  text: string;
  /** Soft background wash for icon tiles. */
  bg: string;
  /** Border utility for outline badges and selected-state rings. */
  border: string;
}

type AccentKey = "green" | "blue" | "purple" | "orange";

export const SUPPORTED_PROGRAM_NAMES = [
  "Computer Hardware Servicing",
  "Cellphone Hardware Servicing",
] as const;

export type SupportedProgramName = (typeof SUPPORTED_PROGRAM_NAMES)[number];

export function isSupportedProgramName(name: string): name is SupportedProgramName {
  return SUPPORTED_PROGRAM_NAMES.includes(name as SupportedProgramName);
}

const ACCENTS: Record<AccentKey, AccentTokens> = {
  green: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  blue: { text: "text-brand-blue", bg: "bg-brand-blue/10", border: "border-brand-blue/30" },
  purple: { text: "text-brand-purple", bg: "bg-brand-purple/10", border: "border-brand-purple/30" },
  orange: { text: "text-brand-orange", bg: "bg-brand-orange/10", border: "border-brand-orange/30" },
};

/** Resolves `Program.accentColor` to design tokens. Defaults to brand green. */
export function resolveAccent(accentColor: string | null | undefined): AccentTokens {
  const key = accentColor?.toLowerCase().trim();
  if (key === "blue" || key === "purple" || key === "orange") {
    return ACCENTS[key];
  }
  return ACCENTS.green;
}

export interface ProgramImagery {
  /**
   * "photo" when a real photograph genuinely depicts this program's
   * training; "icon" when no such photograph exists anywhere in the asset
   * set and a deliberate accent-tinted icon panel is used instead.
   */
  kind: "photo" | "icon";
  src?: string;
}

/**
 * Curated gallery photos that genuinely depict each program's training —
 * hand-picked, not name-matched by coincidence. `public/images/gallery`
 * (prisma/seed.ts GALLERY_PHOTOS) is entirely repair-bench, soldering, and
 * certificate photos. Only the two active HardTech programs are mapped
 * here; unsupported legacy rows fail closed elsewhere before reaching public
 * selectors/cards.
 */
const CURATED_PROGRAM_PHOTOS: Record<string, string> = {
  "Computer Hardware Servicing": "/images/gallery/gallery-01.jpg",
  "Cellphone Hardware Servicing": "/images/gallery/gallery-08.jpg",
  "Networking Basics": "/images/gallery/gallery-05.jpg",
  "CCTV Installation": "/images/gallery/gallery-11.jpg",
};

/**
 * Resolves the marketing image for a program, or a deliberate fallback.
 *
 * `Program.imageUrl` is DATA-seeded and null for the active seeded rows (see
 * prisma/seed.ts). The three supported programs have curated photos that
 * actually show their training; any unexpected row gets a deliberate icon
 * fallback instead of a blank/void card.
 */
export function resolveProgramImagery(program: {
  name: string;
  imageUrl?: string | null;
}): ProgramImagery {
  if (program.imageUrl) return { kind: "photo", src: program.imageUrl };
  const curated = CURATED_PROGRAM_PHOTOS[program.name];
  if (curated) return { kind: "photo", src: curated };
  return { kind: "icon" };
}

/**
 * Resolves `Program.iconName` to a lucide glyph. Defaults to a generic cap
 * for anything unrecognized.
 *
 * Keys below match prisma/seed.ts's active seeded values exactly: "Cpu" and
 * "Smartphone". A handful of lowercase/kebab aliases are kept alongside so
 * this stays correct if a future seed uses a different casing convention.
 *
 * The "Code"/"software" branch was removed with the I.T. Software Development
 * program — no seeded program resolves to it any more, and a switch arm no
 * input can reach is dead weight that reads as still-supported. A future
 * software course adds it back along with its seed row.
 */
export function renderProgramIcon(iconName: string | null | undefined, className?: string) {
  switch (iconName?.toLowerCase().trim()) {
    case "cpu":
    case "chip":
    case "hardware":
    case "computer-hardware":
      return <Cpu className={className} aria-hidden />;
    case "smartphone":
    case "phone":
    case "mobile":
    case "cellphone-hardware":
      return <Smartphone className={className} aria-hidden />;
    default:
      return <GraduationCap className={className} aria-hidden />;
  }
}
