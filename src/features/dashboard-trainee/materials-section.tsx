import { Download, FileText, Video } from "lucide-react";

import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TraineeMaterialItem } from "@/server/services/dashboard.service";
import { formatFileSize } from "@/features/dashboard-trainer/format";
import { cn } from "@/lib/utils";

export type MaterialsSectionProps = {
  materials: TraineeMaterialItem[];
};

const MATERIAL_FILE_TYPE_LABEL: Record<TraineeMaterialItem["fileType"], string> = {
  PDF: "PDF",
  MP4: "MP4",
  DOCX: "DOCX",
};

export function MaterialsSection({ materials }: MaterialsSectionProps) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Learning Materials" />

      {materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <span
              className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary"
              aria-hidden
            >
              <FileText className="size-5" />
            </span>
            <p className="font-heading text-sm font-semibold text-foreground">No materials yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Your trainer hasn&apos;t uploaded learning materials yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((material) => {
            const isVideo = material.fileType === "MP4";
            const Icon = isVideo ? Video : FileText;
            return (
              <Card key={material.id}>
                <CardContent className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full",
                        isVideo ? "bg-brand-blue/15 text-brand-blue" : "bg-primary/15 text-primary",
                      )}
                      aria-hidden
                    >
                      <Icon className="size-5" />
                    </span>
                    <Badge variant="outline">{MATERIAL_FILE_TYPE_LABEL[material.fileType]}</Badge>
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold text-foreground">{material.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Unit {material.unitNumber} · {formatFileSize(material.fileSizeBytes)}
                    </p>
                  </div>
                  {material.delivery.state === "READY" ? (
                    <Button asChild type="button" variant="outline" className="w-full">
                      <a href={material.delivery.url} target="_blank" rel="noreferrer">
                        <Download className="size-4" aria-hidden /> Download
                      </a>
                    </Button>
                  ) : material.delivery.state === "PROCESSING" ? (
                    <p className="text-sm text-muted-foreground">This material is being verified and will be available shortly.</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">This material is currently unavailable.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
