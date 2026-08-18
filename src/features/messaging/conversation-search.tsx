"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 400;

/**
 * Conversation list search box. Debounce idiom copied verbatim from
 * src/features/dashboard-admin/components/user-management-filters.tsx: a
 * setTimeout/clearTimeout pair in a ref, 400ms, `router.replace` pushing the
 * URL so the server component page re-fetches
 * (`searchConversations`/`listConversations`) rather than filtering
 * client-side — same "URL is the source of truth" pattern as that file, so a
 * bookmarked/shared /messages?search=... link reproduces the same view.
 *
 * `basePath` lets this work from both /messages and /messages/[conversationId]
 * without hardcoding which route re-renders.
 */
export function ConversationSearch({ basePath, search }: { basePath: string; search: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Resync from the URL when it changes from outside this component (back
  // button, a fresh navigation) — adjusted during render, not inside a
  // useEffect, per the same react-hooks/set-state-in-effect reasoning
  // documented in user-management-filters.tsx.
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

  function pushSearch(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("search", value);
    else params.delete("search");
    router.replace(`${basePath}?${params.toString()}`);
  }

  function handleChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => pushSearch(value), SEARCH_DEBOUNCE_MS);
  }

  return (
    <div className="relative">
      <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      <Input
        placeholder="Search conversations..."
        className="h-9 pl-8"
        value={searchValue}
        onChange={(event) => handleChange(event.target.value)}
        aria-label="Search conversations"
      />
    </div>
  );
}
