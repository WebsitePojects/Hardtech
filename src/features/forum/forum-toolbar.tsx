"use client";

import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { ArrowUpDown, ChevronDown, Search } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            className="pl-8"
          />
        </div>

        <Select value={sort} onValueChange={(value) => navigate({ sort: value })}>
          <SelectTrigger className="w-full sm:w-44">
            <ArrowUpDown className="size-3.5" aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {SORT_LABELS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
