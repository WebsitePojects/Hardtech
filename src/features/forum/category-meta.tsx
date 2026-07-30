import {
  Briefcase,
  HelpCircle,
  Megaphone,
  MessageSquare,
  type LucideIcon,
  BookOpen,
  Wrench,
} from "lucide-react";

import type { ForumCategory } from "@/../generated/prisma/enums";
import { CATEGORY_LABELS } from "./types";

/**
 * Icon + accent per forum category (desktop-01.md #11, desktop-02.md #28-31,
 * mobile-01.md #24-27). Only two accent colours are actually confirmed by a
 * screenshot: Q&A Help highlights blue when active (desktop-02.md #28) and
 * Announcements highlights amber (desktop-02.md #31, matching the PINNED/
 * TRENDING amber convention). desktop-02.md #30 shows Career & Jobs's own
 * category chip as "pink/magenta", but no pink/magenta token exists in
 * docs/research/01-design-source.md's token set — colour-from-tokens-only
 * per .claude/rules/20-design-fidelity.md means that exact hue cannot be
 * reproduced. Flagged NOT SOURCED; approximated with the closest available
 * token (brand-purple) rather than inventing a hex value. General
 * Discussion, Resources & Tips, and Troubleshooting have no confirmed accent
 * colour either — left neutral.
 */
export const CATEGORY_ICONS: Record<ForumCategory, LucideIcon> = {
  GENERAL_DISCUSSION: MessageSquare,
  QA_HELP: HelpCircle,
  RESOURCES_TIPS: BookOpen,
  TROUBLESHOOTING: Wrench,
  CAREER_JOBS: Briefcase,
  ANNOUNCEMENTS: Megaphone,
};

export const CATEGORY_ACCENT_CLASS: Record<ForumCategory, string> = {
  GENERAL_DISCUSSION: "text-foreground",
  QA_HELP: "text-brand-blue",
  RESOURCES_TIPS: "text-foreground",
  TROUBLESHOOTING: "text-foreground",
  // NOT SOURCED exact hue — source shows pink/magenta, no such token exists.
  CAREER_JOBS: "text-brand-purple",
  ANNOUNCEMENTS: "text-brand-orange",
};

export const CATEGORY_BADGE_CLASS: Record<ForumCategory, string> = {
  GENERAL_DISCUSSION: "border-border text-foreground",
  QA_HELP: "border-brand-blue/40 bg-brand-blue/10 text-brand-blue",
  RESOURCES_TIPS: "border-border text-foreground",
  TROUBLESHOOTING: "border-border text-foreground",
  CAREER_JOBS: "border-brand-purple/40 bg-brand-purple/10 text-brand-purple",
  ANNOUNCEMENTS: "border-brand-orange/40 bg-brand-orange/10 text-brand-orange",
};

export function categoryLabel(category: ForumCategory): string {
  return CATEGORY_LABELS[category];
}
