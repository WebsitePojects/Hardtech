"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type KeyboardEvent } from "react";
import { ArrowUpDown, ChevronDown, CircleCheck, Search } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CATEGORY_ICONS, categoryLabel } from "./category-meta";
import { FORUM_CATEGORIES, SORT_LABELS } from "./types";
import type { ForumCategory } from "@/../generated/prisma/enums";
import type { ForumSort } from "./types";

const SORT_VALUES: ForumSort[] = ["newest", "most_active", "most_viewed", "most_reactions"];

/**
 * Search input + sort control, shared by desktop and mobile
 * (desktop-01.md #11: search + "↕ Newest ⌄"; mobile-01.md #24-26: same
 * search + sort icon-button, plus a collapsible "Filter by Category / Tag"
 * chip row that desktop instead renders as the always-visible left rail).
 * Client component: both fields navigate by pushing an updated query string.
 */
export function ForumToolbar({
  basePath,
  search,
  sort,
  activeCategory,
  searchParamsForNav,
}: {
  basePath: string;
  search?: string;
  sort: ForumSort;
  activeCategory?: ForumCategory;
  searchParamsForNav: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [isSortPending, startSortTransition] = useTransition();

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(
      Object.entries(searchParamsForNav).filter(([, v]) => v !== undefined) as [string, string][],
    );
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      navigate({ search: searchValue.trim() || undefined });
    }
  }

  // Sort actually reorders the list: `sort` flows down from the /forum server
  // component, which re-derives the post order from the URL on every
  // navigation (see sortPosts in src/app/(app)/forum/page.tsx). This handler
  // only ever changes the URL — no client-side reordering, no second data
  // path. Guarded per .claude/rules/00-non-negotiables.md rule 1: disabled +
  // pending state + early-return while a navigation is already in flight, and
  // a no-op re-select of the current option never re-triggers it.
  function handleSortChange(value: ForumSort) {
    if (isSortPending || value === sort) return;
    startSortTransition(() => {
      navigate({ sort: value === "newest" ? undefined : value });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={() => navigate({ search: searchValue.trim() || undefined })}
            placeholder="Search posts, authors, or tags..."
            className="h-10 border-glass-border bg-glass pl-8 text-xs"
          />
        </div>

        {/* Sort control. Panel treatment matched off the live reference's own
            `/forum` sort menu (measured directly with Playwright, not copied
            from the Explore mega-menu spec — that panel turned out to use a
            different, greener treatment than this compact one actually
            ships). Opaque surface, no backdrop-filter. */}
        <DropdownMenu open={sortOpen} onOpenChange={setSortOpen}>
          <DropdownMenuTrigger
            disabled={isSortPending}
            aria-label="Sort posts"
            className={cn(
              "flex h-10 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium whitespace-nowrap transition-colors outline-none sm:w-auto sm:justify-start",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none",
              sortOpen
                ? "border-primary/35 bg-primary/10 text-primary"
                : "border-glass-border bg-[var(--glass-hover)] text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowUpDown className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{SORT_LABELS[sort]}</span>
            <ChevronDown
              className={cn(
                "size-3.5 shrink-0 transition-transform motion-reduce:transition-none",
                sortOpen && "rotate-180",
              )}
              aria-hidden
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="z-[100] w-40 min-w-40 rounded-[16px] border p-1.5 text-popover-foreground"
            // The in-page menu surface, measured off the reference. Distinct
            // from the navbar's Explore panel, which is darker and carries a
            // green hairline — see --menu-bg-soft in globals.css.
            style={{
              backgroundColor: "var(--menu-bg-soft)",
              borderColor: "var(--menu-border)",
              boxShadow: "var(--shadow-menu)",
            }}
          >
            {SORT_VALUES.map((value) => {
              const isActive = value === sort;
              return (
                <DropdownMenuItem
                  key={value}
                  disabled={isSortPending}
                  aria-current={isActive}
                  onSelect={() => handleSortChange(value)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-[14px] px-3 py-2 text-xs font-medium outline-none transition-colors",
                    "focus-visible:ring-2 focus-visible:ring-primary",
                    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
                    isActive
                      ? "bg-primary/12 text-primary focus:bg-primary/12 focus:text-primary"
                      : "text-muted-foreground focus:bg-[var(--glass-hover)] focus:text-foreground",
                  )}
                >
                  {SORT_LABELS[value]}
                  {isActive ? <CircleCheck className="size-3 shrink-0" aria-hidden /> : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile-only category chips — desktop's LeftRail carries this
          instead (removed entirely on mobile, not relocated, per the
          contract and mobile-01.md's layout rules). */}
      <Collapsible open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen} className="lg:hidden">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Filter by Category / Tag</span>
            <ChevronDown className={cn("size-4 transition-transform", categoryFilterOpen && "rotate-180")} aria-hidden />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={!activeCategory ? "default" : "outline"}
              size="sm"
              onClick={() => navigate({ category: undefined })}
            >
              All
            </Button>
            {FORUM_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              return (
                <Button
                  key={category}
                  type="button"
                  variant={activeCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate({ category })}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {categoryLabel(category)}
                </Button>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
