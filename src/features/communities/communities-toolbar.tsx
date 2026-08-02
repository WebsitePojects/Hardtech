"use client";

import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMUNITY_TOPIC_LABELS } from "./types";
import type { CommunityTopic } from "@/../generated/prisma/enums";

const TOPICS: CommunityTopic[] = ["MOBILE_REPAIR", "DESKTOP_REPAIR", "NETWORKING", "TROUBLESHOOTING"];

/**
 * Search + region + topic filters on the Communities tab/page
 * (desktop-02.md #28: "Search communities by name, city, or tag..." +
 * "📍 All regions" + "▽ All topics"). Client component: all three fields
 * navigate by pushing an updated query string, same pattern as
 * forum-toolbar.tsx.
 */
export function CommunitiesToolbar({
  basePath,
  search,
  region,
  topic,
  regionOptions,
  searchParamsForNav,
}: {
  basePath: string;
  search?: string;
  region?: string;
  topic?: CommunityTopic;
  regionOptions: string[];
  searchParamsForNav: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(search ?? "");

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
    if (event.key === "Enter") navigate({ search: searchValue.trim() || undefined });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={() => navigate({ search: searchValue.trim() || undefined })}
          placeholder="Search communities by name, city, or tag..."
          className="h-10 border-glass-border bg-glass pl-8 text-xs"
        />
      </div>

      <Select value={region ?? "all"} onValueChange={(value) => navigate({ region: value === "all" ? undefined : value })}>
        <SelectTrigger className="h-10 w-full border-glass-border bg-glass text-xs sm:w-44">
          <SelectValue placeholder="All regions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">📍 All regions</SelectItem>
          {regionOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={topic ?? "all"} onValueChange={(value) => navigate({ topic: value === "all" ? undefined : value })}>
        <SelectTrigger className="h-10 w-full border-glass-border bg-glass text-xs sm:w-44">
          <SelectValue placeholder="All topics" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All topics</SelectItem>
          {TOPICS.map((value) => (
            <SelectItem key={value} value={value}>
              {COMMUNITY_TOPIC_LABELS[value]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
