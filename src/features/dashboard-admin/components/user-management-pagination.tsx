"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Prev/Next paging for User Management. The repository now bounds every
 * fetch with `take`/`skip` (src/server/repositories/user.repository.ts);
 * this is that boundary's UI half — see the DEFECT-USER-LIST brief this
 * ships under (23 seeded users already produced 8.8 screens of continuous
 * scroll at 390x844 with zero bound on the query).
 *
 * Numbered/windowed pagination was passed over for a simpler Prev/Next: an
 * admin console operator gets to a specific person primarily through the
 * search box and role filter above the list (UserManagementFilters), not by
 * scanning page numbers, so a page picker earns its keep less than it would
 * on a browse-first list. Prev/Next is also the smallest control surface
 * that still satisfies "advancing a page shows a different set of records"
 * without inventing a virtualized-list dependency this table doesn't need
 * at the scale this app actually reaches (thousands of rows, not millions).
 *
 * Same `router.replace` + preserved-query-params pattern as
 * `AuditLogCategoryFilter` and `UserManagementFilters`, so a page change
 * re-fetches the *paginated* server result — the whole table is never held
 * client-side to be sliced in the browser.
 */
export function UserManagementPagination({
  page,
  totalPages,
  total,
  pageSize,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const firstRecordIndex = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRecordIndex = Math.min(page * pageSize, total);

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(nextPage, 1), totalPages);
    if (clamped === page) return;

    const params = new URLSearchParams(searchParams);
    params.set("section", "user-management");
    if (clamped === 1) params.delete("page");
    else params.set("page", String(clamped));
    router.replace(`/dashboard/admin?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-4 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {firstRecordIndex}-{lastRecordIndex} of {total} users
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <span className="min-w-[6.5rem] text-center text-sm text-foreground">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
