import { FileText, Upload } from "lucide-react";

import type { TrainerModuleItem } from "@/server/services/dashboard.service";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDisplayDate, formatFileSize } from "../format";

const MODULE_FILE_TYPE_LABEL: Record<TrainerModuleItem["fileType"], string> = {
  PDF: "PDF",
  MP4: "MP4",
  DOCX: "DOCX",
};

export function ModulesSection({ modules }: { modules: TrainerModuleItem[] }) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Modules" />

      <Card>
        <CardHeader>
          <CardTitle>Upload New Module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground placeholder:text-muted-foreground"
            placeholder="Title..."
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground">
              <option>PDF</option>
              <option>MP4</option>
              <option>DOCX</option>
            </select>
            <input
              className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground"
              defaultValue="1"
            />
          </div>
          <Button type="button" variant="outline" disabled>
            <Upload className="size-4" aria-hidden /> Upload
          </Button>
          <p className="text-xs text-muted-foreground">TODO(orchestrator): no module upload mutation was requested for this wave.</p>
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
              <div key={module.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary" aria-hidden>
                  <FileText className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{module.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Unit {module.unitNumber} · {MODULE_FILE_TYPE_LABEL[module.fileType]} · {formatFileSize(module.fileSizeBytes)} ·{" "}
                    {formatDisplayDate(module.createdAt)}
                  </p>
                </div>
                <Badge variant="outline">{MODULE_FILE_TYPE_LABEL[module.fileType]}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
