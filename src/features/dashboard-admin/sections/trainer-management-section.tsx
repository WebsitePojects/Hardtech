import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { TrainerCard, type TrainerManagementItem } from "../components/trainer-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";

// NOT SOURCED: dashboard.service has no trainer-roster read. Typed and
// mapped for real below so TrainerCard's remove-trainee guard is exercised
// by real code; it is simply fed no rows until that read exists.
const TRAINERS: TrainerManagementItem[] = [];

/**
 * "Trainer Management" (desktop-02.md #8, mobile-05.md #12-14).
 */
export function TrainerManagementSection() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Trainer Management" />

      {TRAINERS.length === 0 ? (
        <DataNotConnectedNote detail="The trainer roster has no service read yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {TRAINERS.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
