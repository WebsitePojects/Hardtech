import { FileText } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";

export type MaterialsSectionProps = {
  materialsCount: number;
};

/**
 * desktop-02.md #26, mobile-06.md 14:32:39/14:32:42: "Learning Materials" —
 * a grid of per-file cards (title, PDF/MP4/DOCX Badge, "Unit N · size",
 * Download button) sourced from `Module` rows.
 *
 * `dashboard.service.ts` only exposes the *count* of those rows
 * (`TraineeOverview.materialsCount`, internally
 * `moduleRepository.countByProgramId`) — no read returns the titles, file
 * types, or sizes the real card grid needs, and per
 * .claude/rules/10-architecture.md this builder may not import a
 * repository directly to get them. Rendering 4 cards with invented titles
 * would violate .claude/rules/20-design-fidelity.md ("do not invent");
 * claiming zero materials would misrepresent the one real number this page
 * does have. So: the sourced count renders, the per-file grid does not.
 *
 * TODO(orchestrator): dashboard.service lacks a trainee materials-list read
 * (Module rows for the trainee's active program: title, fileType,
 * unitNumber, fileSizeBytes). Wire the grid from desktop-02.md #26 once it
 * exists.
 */
export function MaterialsSection({ materialsCount }: MaterialsSectionProps) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Learning Materials" />

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <span
            className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
            aria-hidden
          >
            <FileText className="size-5" />
          </span>
          <p className="font-heading text-sm font-semibold text-foreground">
            {materialsCount} material{materialsCount === 1 ? "" : "s"} on file
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Per-file details aren&apos;t available in this build yet — check back once the materials
            list is wired up.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
