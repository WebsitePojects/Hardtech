"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_ROLE_FILTER_OPTIONS } from "../confirmed-options";

const ROLE_FILTER_LABEL_TO_SENTINEL: Record<string, string> = {
  "All roles": "ALL",
  Admins: "ADMIN",
  Trainers: "TRAINER",
  Trainees: "TRAINEE",
};
const ROLE_FILTER_SENTINEL_TO_LABEL: Record<string, string> = {
  ALL: "All roles",
  ADMIN: "Admins",
  TRAINER: "Trainers",
  TRAINEE: "Trainees",
};

const SEARCH_DEBOUNCE_MS = 400;

/**
 * User Management's search box + role filter (desktop-02.md #4,
 * mobile-05.md #7). Previously rendered with no `value`/`onChange` at all —
 * a decorative `<Select>`/`<Input>` pair that did not filter anything. Now
 * drives `getAdminUserList` (src/server/services/dashboard.service.ts)
 * server-side through the URL's `search`/`role` params, the same
 * `router.replace` pattern `AuditLogCategoryFilter`
 * (../components/audit-log-category-filter.tsx) already established for
 * this dashboard — a change here re-fetches the whole filtered dataset
 * rather than filtering only the page of rows already on screen. Either
 * control resets `page` back to 1: a page number valid for the unfiltered
 * 23 rows can point past the end of a 2-row search result.
 */
export function UserManagementFilters({ search, role }: { search: string; role: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The URL is the source of truth; resync local input state when it
  // changes from outside this component (e.g. a role change resets `page`
  // via the same params object, or the browser back button). Adjusted
  // during render — not inside a useEffect — per React's own guidance for
  // "resetting state when a prop changes" (react-hooks/set-state-in-effect):
  // a ref tracks the last `search` prop seen, and a mismatch means the URL
  // moved out from under this component since the last render.
  const [prevSearchProp, setPrevSearchProp] = useState(search);
  if (search !== prevSearchProp) {
    setPrevSearchProp(search);
    setSearchValue(search);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function pushParams(next: { search?: string; role?: string }) {
    const params = new URLSearchParams(searchParams);
    params.set("section", "user-management");
    params.delete("page"); // any filter change starts back at page 1

    const nextSearch = next.search ?? search;
    if (nextSearch) params.set("search", nextSearch);
    else params.delete("search");

    const nextRole = next.role ?? role;
    if (nextRole && nextRole !== "ALL") params.set("role", nextRole);
    else params.delete("role");

    router.replace(`/dashboard/admin?${params.toString()}`);
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushParams({ search: value }), SEARCH_DEBOUNCE_MS);
  }

  function handleRoleChange(label: string) {
    const sentinel = ROLE_FILTER_LABEL_TO_SENTINEL[label] ?? "ALL";
    pushParams({ role: sentinel });
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {/*
        h-11 (44px, the touch-target floor) below `sm`, h-8 (the shadcn
        default, matching the measured reference density) from `sm` up —
        this pair was the known-outstanding 32px mobile touch target
        (see CLAUDE.md work item H). twMerge (src/lib/utils.ts `cn`)
        resolves the height conflict against the primitive's own `h-8`
        default in favor of whichever class comes last, so this className
        genuinely overrides it rather than losing a specificity tie — see
        the lessons-log entries on Tailwind utilities silently not applying.
      */}
      <Select
        value={ROLE_FILTER_SENTINEL_TO_LABEL[role] ?? ADMIN_ROLE_FILTER_OPTIONS[0]}
        onValueChange={handleRoleChange}
      >
        <SelectTrigger className="h-11 w-full sm:h-8 sm:w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ADMIN_ROLE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Search users..."
          className="h-11 pl-8 sm:h-8"
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>
    </div>
  );
}
