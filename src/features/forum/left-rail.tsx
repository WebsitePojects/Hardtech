import Link from "next/link";
import { BarChart3, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS, categoryLabel } from "./category-meta";
import { FORUM_CATEGORIES } from "./types";
import type { ForumStats } from "./types";
import type { ForumCategory } from "@/../generated/prisma/enums";

/** Verbatim, numbered 1-5 (desktop-01.md #11). */
const GUIDELINES = [
  "Be respectful and professional",
  "Stay on-topic for IT training",
  "No spam or self-promotion",
  "Cite your sources",
  "Trainee posts require approval",
];

function buildCategoryHref(category: ForumCategory | null, currentSearch: URLSearchParams) {
  const params = new URLSearchParams(currentSearch);
  if (category) {
    params.set("category", category);
  } else {
    params.delete("category");
  }
  const query = params.toString();
  return query ? `/forum?${query}` : "/forum";
}

/**
 * Left rail: Categories (with per-category counts), Guidelines, Forum Stats
 * (desktop-01.md #11-12). Hidden entirely on mobile — the contract and
 * mobile-01.md #24-27 agree the rails are removed, not relocated, replaced
 * inline by filter chips (see filters-bar.tsx).
 */
export function LeftRail({
  activeCategory,
  totalPosts,
  stats,
  searchParamsForFilters,
}: {
  activeCategory?: ForumCategory;
  totalPosts: number;
  stats: ForumStats;
  searchParamsForFilters: Record<string, string | undefined>;
}) {
  const currentSearch = new URLSearchParams(
    Object.entries(searchParamsForFilters).filter(([, v]) => v !== undefined) as [string, string][],
  );
  currentSearch.delete("category");

  return (
    <div className="hidden w-[236px] shrink-0 flex-col gap-3 lg:flex">
      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0.5 px-3.5 pb-3.5">
          <Link
            href={buildCategoryHref(null, currentSearch)}
            className={cn(
              "flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-glass-hover",
              !activeCategory && "bg-primary/10 text-primary",
            )}
          >
            All Categories
            <Badge variant="secondary">{totalPosts}</Badge>
          </Link>
          {FORUM_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category];
            const isActive = activeCategory === category;
            return (
              <Link
                key={category}
                href={buildCategoryHref(category, currentSearch)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-glass-hover",
                  isActive && "bg-primary/10 text-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" aria-hidden />
                  {categoryLabel(category)}
                </span>
                <Badge variant="secondary">{stats.categoryCounts[category]}</Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <ShieldCheck className="size-4" aria-hidden />
            Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3.5 pb-3.5">
          <ol className="list-decimal space-y-1.5 pl-4 text-xs text-muted-foreground marker:text-primary">
            {GUIDELINES.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border border-glass-border bg-surface-card ring-0">
        <CardHeader className="px-3.5 pb-1 pt-3.5">
          <CardTitle className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            <BarChart3 className="size-4" aria-hidden />
            Forum Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-3.5 pb-3.5 text-xs">
          <div>
            <p className="text-base font-semibold text-foreground">{stats.totalPosts}</p>
            <p className="text-muted-foreground">Posts</p>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{stats.totalReplies}</p>
            <p className="text-muted-foreground">Replies</p>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{stats.totalViews}</p>
            <p className="text-muted-foreground">Total Views</p>
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">{stats.memberCount}</p>
            <p className="text-muted-foreground">Members</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
