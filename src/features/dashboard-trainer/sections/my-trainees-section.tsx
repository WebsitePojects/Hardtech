import type { TrainerTraineeRosterItem } from "@/server/services/dashboard.service";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EvaluationFormCard } from "../trainee-evaluation-form";

export function MyTraineesSection({ trainees }: { trainees: TrainerTraineeRosterItem[] }) {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="My Trainees" />

      {trainees.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No trainees assigned yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {trainees.map((trainee) => (
            <EvaluationFormCard key={trainee.enrollmentId} trainee={trainee} />
          ))}
        </div>
      )}
    </div>
  );
}
