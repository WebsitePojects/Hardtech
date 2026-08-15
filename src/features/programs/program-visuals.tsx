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
import { Camera, Code2, Cpu, GraduationCap, Network, Smartphone } from "lucide-react";

export interface AccentTokens {
  /** Text color utility, e.g. for the icon glyph and price. */
  text: string;
  /** Soft background wash for icon tiles. */
  bg: string;
  /** Border utility for outline badges and selected-state rings. */
  border: string;
}

type AccentKey = "green" | "blue" | "purple" | "orange";

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
 * certificate photos; none show networking or CCTV work, so those two
 * programs are deliberately left out of this table rather than assigned a
 * photo that would misrepresent them.
 */
const CURATED_PROGRAM_PHOTOS: Record<string, string> = {
  "Computer Hardware Servicing": "/images/gallery/gallery-01.jpg",
  "Cellphone Hardware Servicing": "/images/gallery/gallery-08.jpg",
  "I.T. Software Development": "/images/gallery/gallery-15.jpg",
  "Networking Basics": "/images/gallery/gallery-05.jpg",
  "CCTV Installation": "/images/gallery/gallery-11.jpg",
};

/**
 * Resolves the marketing image for a program, or a deliberate fallback.
 *
 * `Program.imageUrl` is DATA-seeded and null for all five seeded rows (see
 * prisma/seed.ts). Three programs have a curated photo that actually shows
 * their training; "Networking Basics" and "CCTV Installation" do not, and
 * previously fell through to `undefined` — rendering a blank/void card on
 * the homepage carousel and, on `/programs`, causing the whole card to be
 * skipped (`if (!marketingImage) return null`), silently dropping both
 * programs from the catalogue page entirely. Both call sites now use this
 * single resolver so every program renders: a real photo when one honestly
 * exists, otherwise an accent-tinted icon panel bearing the program's own
 * icon and name — a designed fallback, not an absent one.
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
 * Keys below match prisma/seed.ts's actual seeded values exactly — "Cpu",
 * "Smartphone", "Code", "Network", "Camera" (5 programs: Computer Hardware
 * Servicing, Cellphone Hardware Servicing, I.T. Software Development,
 * Networking Basics, CCTV Installation) — the same source ROUTES-A's
 * carousel maps, so the two icon maps agree. A handful of lowercase/kebab
 * aliases are kept alongside so this stays correct even if a future seed
 * uses a different casing convention.
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
    case "code":
    case "code-2":
    case "software":
    case "dev":
    case "it-software":
      return <Code2 className={className} aria-hidden />;
    case "network":
    case "networking":
      return <Network className={className} aria-hidden />;
    case "camera":
    case "cctv":
      return <Camera className={className} aria-hidden />;
    default:
      return <GraduationCap className={className} aria-hidden />;
  }
}
