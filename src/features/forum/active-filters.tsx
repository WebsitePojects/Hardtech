import Link from "next/link";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "./category-meta";
import type { ForumCategory } from "@/../generated/prisma/enums";

/**
 * "Filtering by: [chip ×] Clear all" row (desktop-02.md #28, #30-31).
 * Only appears when a category filter is active in this slice's evidence,
 * so this renders nothing when there is none.
 */
export function ActiveFilters({
  category,
  clearHref,
  removeCategoryHref,
}: {
  category?: ForumCategory;
  clearHref: string;
  removeCategoryHref: string;
}) {
  if (!category) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Filtering by:</span>
      <Badge variant="secondary" className="gap-1">
        {categoryLabel(category)}
        <Link href={removeCategoryHref} aria-label="Remove category filter">
          <X className="size-3" aria-hidden />
        </Link>
      </Badge>
      <Link href={clearHref} className="text-primary hover:underline">
        Clear all
      </Link>
    </div>
  );
}
