"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type QueueQueryValues = {
  view: string;
  search: string;
  status: string;
  program: string;
  from: string;
  to: string;
};

type QueueQueryKey = keyof QueueQueryValues;

function queueParam(prefix: string, key: QueueQueryKey): string {
  return `${prefix}${key[0].toUpperCase()}${key.slice(1)}`;
}

function applyQueueParams(
  params: URLSearchParams,
  prefix: string,
  section: string,
  next: Partial<QueueQueryValues>,
) {
  params.set("section", section);
  params.delete(`${prefix}Page`);
  for (const [key, value] of Object.entries(next) as [QueueQueryKey, string][]) {
    const parameter = queueParam(prefix, key);
    if (!value || value === "ALL" || (key === "view" && value === "queue")) params.delete(parameter);
    else params.set(parameter, value);
  }
}

export function OperationalQueueFilters({
  section,
  prefix,
  values,
  statusOptions,
  programs,
}: {
  section: string;
  prefix: string;
  values: QueueQueryValues;
  statusOptions: { value: string; label: string }[];
  programs: { id: string; shortName: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(values.search);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounce.current) clearTimeout(debounce.current);
  }, []);

  function replace(next: Partial<QueueQueryValues>) {
    const params = new URLSearchParams(searchParams);
    applyQueueParams(params, prefix, section, next);
    router.replace(`/dashboard/admin?${params.toString()}`);
  }

  function changeSearch(value: string) {
    setSearch(value);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => replace({ search: value }), 350);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={values.view === "queue" ? "default" : "outline"} onClick={() => replace({ view: "queue", status: "ALL" })}>
          Action queue
        </Button>
        <Button type="button" size="sm" variant={values.view === "history" ? "default" : "outline"} onClick={() => replace({ view: "history", status: "ALL" })}>
          Review history
        </Button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={search} onChange={(event) => changeSearch(event.target.value)} className="h-11 pl-8 md:h-8" placeholder="Search name or reference" />
        </div>
        <Select value={values.status || "ALL"} onValueChange={(status) => replace({ status })}>
          <SelectTrigger className="h-11 w-full md:h-8"><SelectValue /></SelectTrigger>
          <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={values.program || "ALL"} onValueChange={(program) => replace({ program })}>
          <SelectTrigger className="h-11 w-full md:h-8"><SelectValue placeholder="All programs" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All programs</SelectItem>
            {programs.map((program) => <SelectItem key={program.id} value={program.id}>{program.shortName}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input aria-label="From date" type="date" value={values.from} onChange={(event) => replace({ from: event.target.value })} className="h-11 md:h-8" />
        <Input aria-label="To date" type="date" value={values.to} onChange={(event) => replace({ to: event.target.value })} className="h-11 md:h-8" />
      </div>
    </div>
  );
}

export function OperationalQueuePagination({
  section,
  prefix,
  page,
  totalPages,
  total,
  pageSize,
}: {
  section: string;
  prefix: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  function go(next: number) {
    const target = Math.min(Math.max(next, 1), totalPages);
    if (target === page) return;
    const params = new URLSearchParams(searchParams);
    params.set("section", section);
    const pageParam = `${prefix}Page`;
    if (target === 1) params.delete(pageParam); else params.set(pageParam, String(target));
    router.replace(`/dashboard/admin?${params.toString()}`);
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
      <span className="text-muted-foreground">Showing {first}-{last} of {total}</span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Previous page" disabled={page <= 1} onClick={() => go(page - 1)}><ChevronLeft className="size-4" /></Button>
        <span>Page {page} of {totalPages}</span>
        <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Next page" disabled={page >= totalPages} onClick={() => go(page + 1)}><ChevronRight className="size-4" /></Button>
      </div>
    </div>
  );
}
