import { FileText } from "lucide-react";

import type { TrainerModuleItem } from "@/server/services/dashboard.service";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate, formatFileSize } from "../format";
import type { TrainerBatchOption } from "@/server/services/dashboard.service";
import { ModulePublishForm } from "../module-publish-form";

const MODULE_FILE_TYPE_LABEL: Record<TrainerModuleItem["fileType"], string> = {
  PDF: "PDF",
  MP4: "MP4",
  DOCX: "DOCX",
};

export function ModulesSection({ modules, batches }: { modules: TrainerModuleItem[]; batches: TrainerBatchOption[] }) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Modules" />

      <Card>
        <CardHeader>
          <CardTitle>Upload New Module</CardTitle>
        </CardHeader>
        <CardContent>
          <ModulePublishForm batches={batches} />
        </CardContent>
      </Card>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No modules uploaded yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="divide-y divide-glass-border">
            {modules.map((module) => (
              <div key={module.id} className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary" aria-hidden>
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words text-foreground sm:truncate">{module.title}</p>
                  <p className="break-words text-xs text-muted-foreground">
                    Unit {module.unitNumber} · {MODULE_FILE_TYPE_LABEL[module.fileType]} · {formatFileSize(module.fileSizeBytes)} ·{" "}
                    {formatDisplayDate(module.createdAt)}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit shrink-0">{MODULE_FILE_TYPE_LABEL[module.fileType]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
