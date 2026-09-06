import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { getAdminTrainerRoster, getAdminUnassignedActiveEnrollments } from "@/server/services/dashboard.service";
import { TrainerCard, type TrainerManagementItem } from "../components/trainer-card";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { UnassignedEnrollmentList } from "../components/unassigned-enrollment-list";

function initialsFor(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusLabel(status: string | null): string {
  if (status === "ACTIVE") return "active";
  if (status === "ON_LEAVE") return "on leave";
  if (status === "SUSPENDED") return "suspended";
  return "unset";
}

/**
 * "Trainer Management" (desktop-02.md #8, mobile-05.md #12-14).
 */
export async function TrainerManagementSection() {
  const [trainerRoster, unassignedEnrollments] = await Promise.all([
    getAdminTrainerRoster(),
    getAdminUnassignedActiveEnrollments(),
  ]);
  const trainers: TrainerManagementItem[] = trainerRoster.map((trainer) => ({
    id: trainer.trainerId,
    name: trainer.name,
    initials: initialsFor(trainer.name),
    programLabel: trainer.program ?? "Select...",
    traineeCount: trainer.trainees.length,
    status: statusLabel(trainer.status),
    assignedTrainees: trainer.trainees.map((trainee) => ({
      enrollmentId: trainee.enrollmentId,
      batchId: trainee.batchId,
      name: trainee.name,
      programLabel: trainee.program,
    })),
  }));

  return (
    <div className="space-y-6">
      <DashboardPageHeader title="Trainer Management" />

      <UnassignedEnrollmentList enrollments={unassignedEnrollments} />

      {trainers.length === 0 ? (
        <DataNotConnectedNote detail="No trainers found." />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      )}
    </div>
  );
}
