import { userRepository } from "@/server/repositories/user.repository";
import { enrollmentRepository } from "@/server/repositories/enrollment.repository";
import { enrollmentPaymentRepository } from "@/server/repositories/enrollment-payment.repository";
import { certificateRequestRepository } from "@/server/repositories/certificate-request.repository";
import { trainingSessionRepository } from "@/server/repositories/training-session.repository";
import { batchRepository } from "@/server/repositories/batch.repository";
import { moduleRepository } from "@/server/repositories/module.repository";
import { evaluationRepository } from "@/server/repositories/evaluation.repository";
import { notificationRepository } from "@/server/repositories/notification.repository";
import { programRepository } from "@/server/repositories/program.repository";
import { assignmentRepository } from "@/server/repositories/assignment.repository";
import { assignmentSubmissionRepository } from "@/server/repositories/assignment-submission.repository";
import { announcementRepository } from "@/server/repositories/announcement.repository";
import { auditLogRepository } from "@/server/repositories/audit-log.repository";
import {
  userIdSchema,
  notificationLimitSchema,
  auditCategorySchema,
  auditLogLimitSchema,
  analyticsMonthsBackSchema,
} from "@/server/schemas/dashboard.schema";
import type {
  EnrollmentStatus,
  SessionType,
  SubmissionType,
  ModuleFileType,
  PaymentMethod,
  AnnouncementType,
  MediaType,
  AuditCategory,
  CertificateStatus,
  UserStatus,
  TrainerStatus,
  TrainingSession,
  Notification,
  UserRole,
} from "@/../generated/prisma/client";

/**
 * The stat/list reads the three role dashboards need
 * (docs/contracts/wave-2-app.md, DATA-2). Wave 3 builds
 * `/dashboard/{admin,trainer,trainee}`; this module is their data source.
 *
 * Scope note: this covers each role's Overview page (the stat cards +
 * upcoming-sessions list captured in desktop-02.md screenshots 2, 14, 22 and
 * mobile-05.md). It deliberately does NOT cover every admin section seen in
 * the screenshots (User Management table, Trainer Management roster,
 * Certificate Approvals list, Announcements, Payment Methods, Audit Log,
 * the Analytics month-by-month charts) — those are CRUD-heavy admin
 * surfaces that need their own mutation-aware services and are left for
 * whichever wave builds those specific pages. Flagged in the return report,
 * not silently skipped.
 */

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

export type UpcomingSessionItem = {
  id: string;
  title: string;
  sessionType: SessionType;
  sessionDate: Date;
  startTime: string;
  location: string | null;
};

function toUpcomingSessionItem(session: TrainingSession): UpcomingSessionItem {
  return {
    id: session.id,
    title: session.title,
    sessionType: session.sessionType,
    sessionDate: session.sessionDate,
    startTime: session.startTime,
    location: session.location,
  };
}

// ---------------------------------------------------------------------------
// Dashboard shell — sidebar display name (DASH-SHELL, src/app/(dashboard)/layout.tsx)
// ---------------------------------------------------------------------------

export type DashboardUser = { userId: string; name: string; role: UserRole };

/**
 * Cosmetic lookup only — deliberately NOT on the fail-closed authorization
 * path. The layout falls back to a generic label if this returns null; role
 * gating for `/dashboard/*` happens in proxy.ts + requireRole() against the
 * session, never against this function's result.
 */
export async function getDashboardUser(userId: string): Promise<DashboardUser | null> {
  const parsedId = userIdSchema.safeParse(userId);
  if (!parsedId.success) return null;

  const user = await userRepository.findById(parsedId.data);
  if (!user) return null;

  return {
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    role: user.role,
  };
}

// ---------------------------------------------------------------------------
// Admin — System Overview (desktop-02.md #2)
// ---------------------------------------------------------------------------

export type AdminOverviewStats = {
  totalUsers: number;
  pendingEnrollments: number;
  /** Sum of verified payment totals since the 1st of the current calendar month. */
  revenueMtd: number;
  pendingCertificateRequests: number;
  programMix: { programId: string; programName: string; activeEnrollmentCount: number }[];
};

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [totalUsers, pendingEnrollments, revenueMtdRaw, pendingCertificateRequests, programMixRows, programs] =
    await Promise.all([
      userRepository.countAll(),
      enrollmentRepository.countByStatus("PENDING_VERIFICATION"),
      enrollmentPaymentRepository.sumAmountByStatusSince("VERIFIED", startOfMonth),
      certificateRequestRepository.countByStatus("PENDING"),
      enrollmentRepository.countGroupByProgram("ACTIVE"),
      programRepository.findAll(),
    ]);

  const programNameById = new Map(programs.map((program) => [program.id, program.shortName]));
  const programMix = programMixRows.map((row) => ({
    programId: row.programId,
    programName: programNameById.get(row.programId) ?? "Unknown program",
    activeEnrollmentCount: row.count,
  }));

  return {
    totalUsers,
    pendingEnrollments,
    revenueMtd: Number(revenueMtdRaw),
    pendingCertificateRequests,
    programMix,
  };
}

// ---------------------------------------------------------------------------
// Trainer — Overview (desktop-02.md #14, mobile-05.md #31-32)
// ---------------------------------------------------------------------------

export type TrainerOverview = {
  trainerId: string;
  /** e.g. "Cellphone Repair · Batch 2026-A" — null if the trainer has no batch yet. */
  batchLabel: string | null;
  assignedTraineeCount: number;
  upcomingSessionCount: number;
  modulesUploadedCount: number;
  evaluationCount: number;
  upcomingSessions: UpcomingSessionItem[];
};

function emptyTrainerOverview(trainerId: string): TrainerOverview {
  return {
    trainerId,
    batchLabel: null,
    assignedTraineeCount: 0,
    upcomingSessionCount: 0,
    modulesUploadedCount: 0,
    evaluationCount: 0,
    upcomingSessions: [],
  };
}

export async function getTrainerOverview(trainerId: string): Promise<TrainerOverview> {
  const parsedId = userIdSchema.safeParse(trainerId);
  if (!parsedId.success) return emptyTrainerOverview(trainerId); // fail closed: no data, never a throw

  const id = parsedId.data;
  const now = new Date();
  const batch = await batchRepository.findFirstByTrainerId(id);

  const [assignedTraineeCount, upcomingSessions, modulesUploadedCount, evaluationCount] =
    await Promise.all([
      batch ? enrollmentRepository.countByBatchId(batch.id) : Promise.resolve(0),
      trainingSessionRepository.findUpcomingByTrainerId(id, now),
      moduleRepository.countByTrainerId(id),
      evaluationRepository.countActiveByTrainerId(id),
    ]);

  return {
    trainerId: id,
    batchLabel: batch ? `${batch.program.shortName} · Batch ${batch.code}` : null,
    assignedTraineeCount,
    upcomingSessionCount: upcomingSessions.length,
    modulesUploadedCount,
    evaluationCount,
    upcomingSessions: upcomingSessions.map(toUpcomingSessionItem),
  };
}

// ---------------------------------------------------------------------------
// Trainee — My Dashboard (desktop-02.md #22, mobile-06.md)
// ---------------------------------------------------------------------------

export type ActiveProgramSummary = {
  programName: string;
  batchLabel: string | null;
  trainerName: string | null;
  progressPercent: number;
  startDate: Date | null;
};

export type TraineeOverview = {
  traineeId: string;
  overallProgressPercent: number;
  sessionsAheadCount: number;
  materialsCount: number;
  /** "NONE" when the trainee has no enrollment at all yet — not the same as any real EnrollmentStatus. */
  status: EnrollmentStatus | "NONE";
  activeProgram: ActiveProgramSummary | null;
  upcomingSessions: UpcomingSessionItem[];
};

function emptyTraineeOverview(traineeId: string): TraineeOverview {
  return {
    traineeId,
    overallProgressPercent: 0,
    sessionsAheadCount: 0,
    materialsCount: 0,
    status: "NONE",
    activeProgram: null,
    upcomingSessions: [],
  };
}

export async function getTraineeOverview(traineeId: string): Promise<TraineeOverview> {
  const parsedId = userIdSchema.safeParse(traineeId);
  if (!parsedId.success) return emptyTraineeOverview(traineeId); // fail closed

  const id = parsedId.data;
  const now = new Date();
  const enrollments = await enrollmentRepository.findManyByTraineeId(id);

  // A trainee can hold several simultaneous enrollments (e.g. Juan Dela Cruz's
  // 3 programs, desktop-02.md #13/mobile-05.md #25-26) — the dashboard shows
  // one "active program" card, so prefer the first ACTIVE one, falling back
  // to the most recent enrollment of any status.
  const activeEnrollment = enrollments.find((e) => e.status === "ACTIVE") ?? enrollments[0] ?? null;

  if (!activeEnrollment) return emptyTraineeOverview(id);

  const [upcomingSessions, materialsCount] = await Promise.all([
    activeEnrollment.batchId
      ? trainingSessionRepository.findUpcomingByBatchId(activeEnrollment.batchId, now)
      : Promise.resolve([]),
    moduleRepository.countByProgramId(activeEnrollment.programId),
  ]);

  const trainer = activeEnrollment.batch?.trainer;

  return {
    traineeId: id,
    overallProgressPercent: activeEnrollment.progressPercent,
    sessionsAheadCount: upcomingSessions.length,
    materialsCount,
    status: activeEnrollment.status,
    activeProgram: {
      programName: activeEnrollment.program.shortName,
      batchLabel: activeEnrollment.batch
        ? `${activeEnrollment.program.shortName} · Batch ${activeEnrollment.batch.code}`
        : null,
      trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : null,
      progressPercent: activeEnrollment.progressPercent,
      startDate: activeEnrollment.startDate,
    },
    upcomingSessions: upcomingSessions.map(toUpcomingSessionItem),
  };
}

// SECURITY NOTE: `getTraineeOverview` and `getTrainerOverview` above accept a
// bare id with no viewer/role check — anyone who can call them can read any
// trainee's or trainer's overview by passing a different id. That footgun
// predates this change and is out of this module's owned scope to alter
// (DATA-3 extends the file, it does not rewrite the existing 4 reads). Every
// read added below takes the *viewer's* id and role and enforces ownership
// itself; the same tightening (thread the caller's session id/role through
// and compare against the target id) should be applied to those two
// pre-existing functions in a follow-up.

// ---------------------------------------------------------------------------
// Admin — Enrollments & Payment Verification (desktop-02.md #3)
// ---------------------------------------------------------------------------

export type PendingEnrollmentQueueItem = {
  paymentId: string;
  trainee: { id: string; name: string };
  /** Program short names this single payment covers — one checkout can fund 1-3 programs. */
  programs: string[];
  /** Whole pesos. Converted from `Decimal` once, at this terminal read, same as `AdminOverviewStats.revenueMtd`. */
  amount: number;
  paymentMethod: PaymentMethod;
  proofImageUrl: string;
  referenceCode: string;
  submittedAt: Date;
};

/**
 * Admin-only surface — no viewer scoping needed (unlike the trainer/trainee
 * reads below, there is no "owner" narrower than the whole admin role; the
 * route/proxy layer is responsible for gating `/dashboard/admin/*` to ADMIN
 * sessions before this ever runs, per .claude/rules/00-non-negotiables.md
 * "Role checks are server-side").
 */
export async function getAdminPendingEnrollmentQueue(): Promise<PendingEnrollmentQueueItem[]> {
  const payments = await enrollmentPaymentRepository.findManySubmittedWithDetails();

  return payments.map((payment) => ({
    paymentId: payment.id,
    trainee: {
      id: payment.trainee.id,
      name: `${payment.trainee.firstName} ${payment.trainee.lastName}`,
    },
    programs: payment.enrollments.map((enrollment) => enrollment.program.shortName),
    amount: Number(payment.totalAmount),
    paymentMethod: payment.paymentMethod,
    proofImageUrl: payment.proofImageUrl,
    referenceCode: payment.referenceCode,
    submittedAt: payment.submittedAt,
  }));
}

// ---------------------------------------------------------------------------
// Admin — User Management (desktop-02.md #4-7)
// ---------------------------------------------------------------------------

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** A trainee's most recent enrollment's program, or a trainer's primary program. `null` for admins and for a trainee/trainer with neither. */
  program: string | null;
  status: UserStatus;
};

/** Admin-only — see the note on `getAdminPendingEnrollmentQueue` above. Never returns `passwordHash`. */
export async function getAdminUserList(): Promise<AdminUserListItem[]> {
  const users = await userRepository.findManyWithProgramContext();

  return users.map((user) => {
    const latestEnrollment = user.enrollmentsAsTrainee[0];
    const program =
      user.role === "TRAINER"
        ? (user.trainerProfile?.primaryProgram?.shortName ?? null)
        : (latestEnrollment?.program.shortName ?? null);

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      program,
      status: user.status,
    };
  });
}

// ---------------------------------------------------------------------------
// Admin — Trainer Management (desktop-02.md #8)
// ---------------------------------------------------------------------------

export type TrainerRosterTrainee = { id: string; enrollmentId: string; batchId: string; name: string; program: string };

export type TrainerRosterItem = {
  trainerId: string;
  name: string;
  program: string | null;
  /** `null` when the trainer has no `TrainerProfile` row yet. */
  status: TrainerStatus | null;
  trainees: TrainerRosterTrainee[];
};

/** Admin-only — see the note on `getAdminPendingEnrollmentQueue` above. Never returns `passwordHash`. */
export async function getAdminTrainerRoster(): Promise<TrainerRosterItem[]> {
  const trainers = await userRepository.findManyTrainersWithRoster();

  return trainers.map((trainer) => {
    // One trainer can have several batches; de-dupe trainees across them by
    // id (a trainee re-enrolled across two of the same trainer's batches
    // should still appear once on the roster card).
    const traineesById = new Map<string, TrainerRosterTrainee>();
    for (const batch of trainer.batchesAsTrainer) {
      for (const enrollment of batch.enrollments) {
        if (traineesById.has(enrollment.trainee.id)) continue;
        traineesById.set(enrollment.trainee.id, {
          id: enrollment.trainee.id,
          enrollmentId: enrollment.id,
          batchId: batch.id,
          name: `${enrollment.trainee.firstName} ${enrollment.trainee.lastName}`,
          program: enrollment.program.shortName,
        });
      }
    }

    return {
      trainerId: trainer.id,
      name: `${trainer.firstName} ${trainer.lastName}`,
      program: trainer.trainerProfile?.primaryProgram?.shortName ?? null,
      status: trainer.trainerProfile?.status ?? null,
      trainees: Array.from(traineesById.values()),
    };
  });
}

// ---------------------------------------------------------------------------
// Admin — Certificate Approvals (desktop-02.md #9)
// ---------------------------------------------------------------------------

export type CertificateRequestItem = {
  id: string;
  certificateCode: string;
  traineeName: string;
  programName: string;
  trainerName: string | null;
  status: CertificateStatus;
  completedAt: Date;
  requestedAt: Date;
  approvedAt: Date | null;
};

export type AdminCertificateRequests = {
  pending: CertificateRequestItem[];
  /** The screenshot shows an approved row as a terminal state alongside the pending queue. */
  approved: CertificateRequestItem[];
};

function toCertificateRequestItem(
  row: Awaited<ReturnType<typeof certificateRequestRepository.findManyByStatus>>[number],
): CertificateRequestItem {
  const trainer = row.enrollment.batch?.trainer;
  return {
    id: row.id,
    certificateCode: row.certificateCode,
    traineeName: `${row.enrollment.trainee.firstName} ${row.enrollment.trainee.lastName}`,
    programName: row.enrollment.program.shortName,
    trainerName: trainer ? `${trainer.firstName} ${trainer.lastName}` : null,
    status: row.status,
    completedAt: row.completedAt,
    requestedAt: row.requestedAt,
    approvedAt: row.approvedAt,
  };
}

/** Admin-only — see the note on `getAdminPendingEnrollmentQueue` above. Never returns `passwordHash`. */
export async function getAdminCertificateRequests(): Promise<AdminCertificateRequests> {
  const [pendingRows, approvedRows] = await Promise.all([
    certificateRequestRepository.findManyByStatus("PENDING"),
    certificateRequestRepository.findManyByStatus("APPROVED"),
  ]);

  return {
    pending: pendingRows.map(toCertificateRequestItem),
    approved: approvedRows.map(toCertificateRequestItem),
  };
}

// ---------------------------------------------------------------------------
// Admin — Announcements (desktop-02.md #10)
// ---------------------------------------------------------------------------

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  isPinned: boolean;
  postedByName: string;
  createdAt: Date;
};

/** Admin-only — see the note on `getAdminPendingEnrollmentQueue` above. Never returns `passwordHash`. */
export async function getAdminAnnouncements(): Promise<AnnouncementItem[]> {
  const rows = await announcementRepository.findAll();

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType,
    isPinned: row.isPinned,
    postedByName: `${row.postedBy.firstName} ${row.postedBy.lastName}`,
    createdAt: row.createdAt,
  }));
}

// ---------------------------------------------------------------------------
// Admin — Audit Log (desktop-02.md #13)
// ---------------------------------------------------------------------------

export type AuditLogEntry = {
  id: string;
  category: AuditCategory;
  action: string;
  description: string | null;
  referenceId: string | null;
  actorName: string | null;
  createdAt: Date;
};

/**
 * Admin-only — see the note on `getAdminPendingEnrollmentQueue` above.
 * `categoryFilter` is untrusted input (e.g. a raw query-string value from
 * the dropdown) re-validated here: an unrecognized category rejects to an
 * empty result, it never silently falls back to "all categories"
 * (.claude/rules/00-non-negotiables.md rule 3). Passing `undefined` is the
 * one explicit way to request "all" — that is the dropdown's own "all"
 * option, not a fallback.
 */
export async function getAdminAuditLog(
  categoryFilter?: string,
  limit = 50,
): Promise<AuditLogEntry[]> {
  let category: AuditCategory | undefined;
  if (categoryFilter !== undefined) {
    const parsedCategory = auditCategorySchema.safeParse(categoryFilter);
    if (!parsedCategory.success) return []; // fail closed
    category = parsedCategory.data;
  }

  const parsedLimit = auditLogLimitSchema.safeParse(limit);
  const rows = await auditLogRepository.findMany(category, parsedLimit.success ? parsedLimit.data : 50);

  return rows.map((row) => ({
    id: row.id,
    category: row.category,
    action: row.action,
    description: row.description,
    referenceId: row.referenceId,
    actorName: row.actor ? `${row.actor.firstName} ${row.actor.lastName}` : null,
    createdAt: row.createdAt,
  }));
}

// ---------------------------------------------------------------------------
// Admin — Reports & Analytics (desktop-02.md #11)
// ---------------------------------------------------------------------------

export type MonthlyCount = { month: string; count: number };
export type MonthlyRevenue = { month: string; total: number };

export type AdminAnalytics = {
  enrollmentsByMonth: MonthlyCount[];
  revenueTrend: MonthlyRevenue[];
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** `"2026-03"` — a stable, locale-independent bucket key shared by the query results and the generated month list. */
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Every calendar month from `monthsBack - 1` months ago through the current month, oldest first, formatted for a recharts X axis (e.g. "Mar 2026"). */
function buildMonthBuckets(monthsBack: number): { key: string; label: string }[] {
  const now = new Date();
  const buckets: { key: string; label: string }[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: monthKey(date),
      label: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    });
  }
  return buckets;
}

/**
 * Admin-only — see the note on `getAdminPendingEnrollmentQueue` above.
 * Shaped directly for `recharts`: a fixed-length array covering every month
 * in the window (zero-filled where no rows exist), not a sparse list —
 * desktop-02.md #11's bar/area charts show flat zero segments for months
 * with no activity, which only renders correctly from a complete series.
 */
export async function getAdminAnalytics(monthsBack = 6): Promise<AdminAnalytics> {
  const parsedMonthsBack = analyticsMonthsBackSchema.safeParse(monthsBack);
  const window = parsedMonthsBack.success ? parsedMonthsBack.data : 6;
  const since = startOfMonth(new Date(new Date().getFullYear(), new Date().getMonth() - (window - 1), 1));

  const [enrollmentRows, revenueRows] = await Promise.all([
    enrollmentRepository.countByMonthSince(since),
    enrollmentPaymentRepository.sumAmountByMonthSince("VERIFIED", since),
  ]);

  const enrollmentByKey = new Map(enrollmentRows.map((row) => [monthKey(row.month), row.count]));
  const revenueByKey = new Map(revenueRows.map((row) => [monthKey(row.month), Number(row.total)]));

  const buckets = buildMonthBuckets(window);
  return {
    enrollmentsByMonth: buckets.map((bucket) => ({
      month: bucket.label,
      count: enrollmentByKey.get(bucket.key) ?? 0,
    })),
    revenueTrend: buckets.map((bucket) => ({
      month: bucket.label,
      total: revenueByKey.get(bucket.key) ?? 0,
    })),
  };
}

// ---------------------------------------------------------------------------
// Trainee ownership helper (shared by every trainee-scoped read below)
// ---------------------------------------------------------------------------

/**
 * A trainee can hold several simultaneous enrollments; this mirrors
 * `getTraineeOverview`'s own selection rule (prefer the first ACTIVE
 * enrollment, falling back to the most recent of any status) so every
 * trainee-scoped read below agrees with the Overview page on which
 * enrollment is "the" active one.
 */
async function findActiveEnrollmentForTrainee(traineeId: string) {
  const enrollments = await enrollmentRepository.findManyByTraineeId(traineeId);
  return enrollments.find((enrollment) => enrollment.status === "ACTIVE") ?? enrollments[0] ?? null;
}

// ---------------------------------------------------------------------------
// Trainer — My Trainees (desktop-02.md #16-18)
// ---------------------------------------------------------------------------

export type TrainerTraineeRosterItem = {
  id: string;
  name: string;
  email: string;
  progressPercent: number;
  isPaid: boolean;
  isTrained: boolean;
};

/**
 * Viewer-scoped: `viewerRole` must be TRAINER, and the roster returned is
 * always the *viewer's own* trainees (their primary batch's enrollments) —
 * there is no id parameter to spoof another trainer's roster with. Any
 * other role fails closed to an empty array.
 */
export async function getTrainerTraineeRoster(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TrainerTraineeRosterItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return []; // fail closed

  const trainerId = parsedId.data;
  const batch = await batchRepository.findFirstByTrainerId(trainerId);
  if (!batch) return [];

  const enrollments = await enrollmentRepository.findManyByBatchId(batch.id);
  const evaluations = await evaluationRepository.findManyActiveByEnrollmentIds(
    enrollments.map((enrollment) => enrollment.id),
  );
  const trainedEnrollmentIds = new Set(evaluations.map((evaluation) => evaluation.enrollmentId));

  return enrollments.map((enrollment) => ({
    id: enrollment.trainee.id,
    name: `${enrollment.trainee.firstName} ${enrollment.trainee.lastName}`,
    email: enrollment.trainee.email,
    progressPercent: enrollment.progressPercent,
    isPaid: enrollment.payment.status === "VERIFIED",
    isTrained: trainedEnrollmentIds.has(enrollment.id),
  }));
}

// ---------------------------------------------------------------------------
// Trainer — Assignments (desktop-02.md #19-20)
// ---------------------------------------------------------------------------

export type TrainerAssignmentItem = {
  id: string;
  title: string;
  instructions: string;
  dueDate: Date;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
};

/** Viewer-scoped: only the assignments the calling TRAINER themself created. Any other role fails closed to an empty array. */
export async function getTrainerAssignments(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TrainerAssignmentItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return []; // fail closed

  const rows = await assignmentRepository.findManyByTrainerId(parsedId.data);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    instructions: row.instructions,
    dueDate: row.dueDate,
    dueTime: row.dueTime,
    allowedSubmissionTypes: row.allowedSubmissionTypes,
  }));
}

// ---------------------------------------------------------------------------
// Trainer — Modules (desktop-02.md #21)
// ---------------------------------------------------------------------------

export type TrainerModuleItem = {
  id: string;
  title: string;
  fileType: ModuleFileType;
  unitNumber: number;
  fileSizeBytes: number;
  createdAt: Date;
};

/** Viewer-scoped: only the modules the calling TRAINER themself uploaded. Any other role fails closed to an empty array. */
export async function getTrainerModules(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TrainerModuleItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return []; // fail closed

  const rows = await moduleRepository.findManyByTrainerId(parsedId.data);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    fileType: row.fileType,
    unitNumber: row.unitNumber,
    fileSizeBytes: row.fileSizeBytes,
    createdAt: row.createdAt,
  }));
}

// ---------------------------------------------------------------------------
// Trainer — Calendar (desktop-02.md #15)
// ---------------------------------------------------------------------------

/** Viewer-scoped: only the calling TRAINER's own sessions, past and future. Any other role fails closed to an empty array. */
export async function getTrainerCalendarSessions(
  viewerId: string,
  viewerRole: UserRole,
): Promise<UpcomingSessionItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return []; // fail closed

  const rows = await trainingSessionRepository.findManyByTrainerId(parsedId.data);
  return rows.map(toUpcomingSessionItem);
}

// ---------------------------------------------------------------------------
// Trainee — Assignments (desktop-02.md #24)
// ---------------------------------------------------------------------------

export type TraineeAssignmentSubmissionState = { submissionLink: string; submittedAt: Date };

export type TraineeAssignmentReadItem = {
  id: string;
  title: string;
  instructions: string;
  dueDate: Date;
  dueTime: string;
  allowedSubmissionTypes: SubmissionType[];
  /** `null` when the signed-in trainee has not submitted yet. */
  submission: TraineeAssignmentSubmissionState | null;
};

/**
 * Viewer-scoped: only assignments posted to the calling TRAINEE's own
 * active batch, and only *their own* submission state — never another
 * trainee's. Any other role fails closed to an empty array.
 */
export async function getTraineeAssignments(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TraineeAssignmentReadItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINEE") return []; // fail closed

  const traineeId = parsedId.data;
  const activeEnrollment = await findActiveEnrollmentForTrainee(traineeId);
  if (!activeEnrollment?.batchId) return [];

  const assignments = await assignmentRepository.findManyByBatchIds([activeEnrollment.batchId]);
  const submissions = await assignmentSubmissionRepository.findManyByTraineeIdAndAssignmentIds(
    traineeId,
    assignments.map((assignment) => assignment.id),
  );
  const submissionByAssignmentId = new Map(
    submissions.map((submission) => [submission.assignmentId, submission]),
  );

  return assignments.map((assignment) => {
    const submission = submissionByAssignmentId.get(assignment.id);
    return {
      id: assignment.id,
      title: assignment.title,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      allowedSubmissionTypes: assignment.allowedSubmissionTypes,
      submission: submission
        ? { submissionLink: submission.submissionLink, submittedAt: submission.submittedAt }
        : null,
    };
  });
}

// ---------------------------------------------------------------------------
// Trainee — Materials (desktop-02.md #26)
// ---------------------------------------------------------------------------

export type TraineeMaterialItem = {
  id: string;
  title: string;
  fileType: ModuleFileType;
  unitNumber: number;
  fileSizeBytes: number;
};

/** Viewer-scoped: only the modules for the calling TRAINEE's own active program. Any other role fails closed to an empty array. */
export async function getTraineeMaterials(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TraineeMaterialItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINEE") return []; // fail closed

  const activeEnrollment = await findActiveEnrollmentForTrainee(parsedId.data);
  if (!activeEnrollment) return [];

  const modules = await moduleRepository.findManyByProgramId(activeEnrollment.programId);
  return modules.map((module) => ({
    id: module.id,
    title: module.title,
    fileType: module.fileType,
    unitNumber: module.unitNumber,
    fileSizeBytes: module.fileSizeBytes,
  }));
}

// ---------------------------------------------------------------------------
// Trainee — Credentials (desktop-02.md #27)
// ---------------------------------------------------------------------------

export type TraineeCertificateStatus = {
  status: CertificateStatus;
  certificateCode: string;
  requestedAt: Date;
  approvedAt: Date | null;
};

/**
 * Viewer-scoped: only the calling TRAINEE's own certificate request, for
 * their own active enrollment. Any other role fails closed to `null`.
 * Returns `null` both when the viewer/role check fails and when no
 * `CertificateRequest` exists yet (the "Locked" state) — the caller cannot
 * distinguish "not allowed" from "not requested yet" from this return value
 * alone, which is the correct fail-closed shape for a viewer-scoped read.
 */
export async function getTraineeCertificateStatus(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TraineeCertificateStatus | null> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINEE") return null; // fail closed

  const activeEnrollment = await findActiveEnrollmentForTrainee(parsedId.data);
  if (!activeEnrollment) return null;

  const request = await certificateRequestRepository.findLatestByEnrollmentId(activeEnrollment.id);
  if (!request) return null;

  return {
    status: request.status,
    certificateCode: request.certificateCode,
    requestedAt: request.requestedAt,
    approvedAt: request.approvedAt,
  };
}

// ---------------------------------------------------------------------------
// Notifications (bell icon, shared across all 3 roles — mobile-03.md help
// "Reading Your Notifications": unread badge, last-20 retention)
// ---------------------------------------------------------------------------

export async function getNotifications(userId: string, limit = 20): Promise<Notification[]> {
  const parsedId = userIdSchema.safeParse(userId);
  if (!parsedId.success) return []; // fail closed

  const parsedLimit = notificationLimitSchema.safeParse(limit);
  return notificationRepository.findManyByUserId(
    parsedId.data,
    parsedLimit.success ? parsedLimit.data : 20,
  );
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const parsedId = userIdSchema.safeParse(userId);
  if (!parsedId.success) return 0; // fail closed
  return notificationRepository.countUnreadByUserId(parsedId.data);
}
