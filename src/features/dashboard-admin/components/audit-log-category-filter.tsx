"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const AUDIT_CATEGORY_OPTIONS = [
  "all",
  "user",
  "enrollment",
  "payment",
  "certificate",
  "calendar",
  "module",
  "system",
] as const;

type AuditCategoryOption = (typeof AUDIT_CATEGORY_OPTIONS)[number];

function isAuditCategoryOption(value: string | undefined): value is AuditCategoryOption {
  return AUDIT_CATEGORY_OPTIONS.some((option) => option === value);
}

export function AuditLogCategoryFilter({ value }: { value: string | undefined }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedValue = isAuditCategoryOption(value) ? value : "all";

  function handleValueChange(nextValue: string) {
    if (!isAuditCategoryOption(nextValue)) return;

    const params = new URLSearchParams(searchParams);
    params.set("section", "audit-log");
    if (nextValue === "all") {
      params.delete("category");
    } else {
      params.set("category", nextValue);
    }
    router.replace(`/dashboard/admin?${params.toString()}`);
  }

  return (
    <Select value={selectedValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {AUDIT_CATEGORY_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
