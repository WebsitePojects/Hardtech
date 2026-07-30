import type { LucideIcon } from "lucide-react";
import { BookOpen, HelpCircle, Image as GalleryIcon, MapPin } from "lucide-react";

/**
 * Shared nav data for the desktop navbar's Explore dropdown and the mobile
 * drawer's two-tier list (docs/screens/desktop-01.md #19, docs/screens/
 * mobile-01.md #9). One source of truth so both surfaces stay in sync.
 */

export type PrimaryNavItem = {
  label: string;
  href: string;
};

export type ExploreNavItem = {
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const primaryNavItems: PrimaryNavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Forum", href: "/forum" },
];

export const exploreNavItems: ExploreNavItem[] = [
  {
    label: "Programs",
    description: "Our training courses",
    href: "/programs",
    icon: BookOpen,
  },
  {
    label: "Gallery",
    description: "Training facility photos",
    href: "/gallery",
    icon: GalleryIcon,
  },
  {
    label: "Contact & Location",
    description: "Find us & get in touch",
    href: "/contact",
    icon: MapPin,
  },
  {
    label: "User Guide",
    description: "Manual & interactive tour",
    href: "/help",
    icon: HelpCircle,
  },
];
