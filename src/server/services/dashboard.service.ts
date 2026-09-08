import { z } from "zod";
import { requireRole } from "@/server/auth/session";
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
  adminQueueDateSchema,
  adminQueuePageSchema,
  adminQueuePagination,
  adminQueueProgramIdSchema,
  adminQueueSearchSchema,
  certificateQueueStatusSchema,
  paymentQueueStatusSchema,
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
  MediaResourceType,
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
  referenceCode: string;
  submittedAt: Date;
};

/**
 * Admin-only surface — no viewer scoping needed (unlike the trainer/trainee
 * reads below, there is no "owner" narrower than the whole admin role; the
 * route/proxy layer is responsible for gating `/dashboard/admin/*` to ADMIN
 * sessions before this ever runs, per .claude/rules/00-non-negotiables.md
 * "Role checks are server-side").
 *
 * NOTE: `proofImageUrl` was removed from this list's output (2026-08-15
 * fix). The repository's list query (`findManySubmittedWithDetails`) no
 * longer selects that column — .claude/rules/50-database.md: "a
 * verification endpoint returns the fact, not the record", and dragging a
 * base64-or-Cloudinary image onto every pending payment on every load does
 * not scale. Fetch a single payment's proof on demand via
 * `getPaymentProofUrl` below (e.g. when an admin opens a "view proof" modal
 * for one queue item) instead of embedding it in this list.
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
    referenceCode: payment.referenceCode,
    submittedAt: payment.submittedAt,
  }));
}

/**
 * Single-payment proof-image read for the admin "view proof" action —
 * see the note on `getAdminPendingEnrollmentQueue` above for why this is a
 * separate, on-demand call rather than a field on the list. Admin-only by
 * the same convention as `getAdminPendingEnrollmentQueue` — no viewer
 * scoping needed, the route/proxy layer gates `/dashboard/admin/*` before
 * this ever runs. Returns `null` when the payment does not exist rather than
 * throwing, so a stale queue row (payment already actioned by another admin)
 * degrades to "no proof to show" instead of a 500.
 */
export async function getPaymentProofUrl(paymentId: string): Promise<string | null> {
  await requireRole("ADMIN");
  const parsedPaymentId = userIdSchema.safeParse(paymentId);
  if (!parsedPaymentId.success) return null;
  return enrollmentPaymentRepository.findProofImageUrl(parsedPaymentId.data);
}

// ---------------------------------------------------------------------------
// Admin — operational payment/certificate queues
// ---------------------------------------------------------------------------

const ADMIN_QUEUE_PAGE_SIZE = 12;

export type AdminOperationalQueueParams = {
  page?: string;
  search?: string;
  status?: string;
  program?: string;
  from?: string;
  to?: string;
  /** Queue is action-only. History is terminal-review-only. */
  view?: string;
};

type NormalizedQueueParams = {
  page: number;
  search?: string;
  programId?: string;
  from?: Date;
  before?: Date;
  view: "queue" | "history";
  invalid: boolean;
};

function normalizeAdminQueueParams(params: AdminOperationalQueueParams): NormalizedQueueParams {
  const page = adminQueuePageSchema.parse(params.page);
  const search = adminQueueSearchSchema.parse(params.search ?? "");
  const view = params.view === undefined || params.view === "queue" ? "queue" : params.view === "history" ? "history" : null;
  const program = params.program === undefined || params.program === "ALL" ? undefined : adminQueueProgramIdSchema.safeParse(params.program);
  const from = params.from === undefined ? undefined : adminQueueDateSchema.safeParse(params.from);
  const to = params.to === undefined ? undefined : adminQueueDateSchema.safeParse(params.to);
  if (!view || (program && !program.success) || (from && !from.success) || (to && !to.success)) {
    return { page: 1, view: "queue", invalid: true };
  }
  const before = to?.data ? new Date(to.data.getTime() + 24 * 60 * 60 * 1000) : undefined;
  if (from?.data && before && from.data >= before) return { page: 1, view, invalid: true };
  return {
    page,
    search: search || undefined,
    programId: program?.data,
    from: from?.data,
    before,
    view,
    invalid: false,
  };
}

function emptyAdminQueue<T>() {
  return { items: [] as T[], total: 0, page: 1, pageSize: ADMIN_QUEUE_PAGE_SIZE, totalPages: 1 };
}

type AdminQueuePage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminPaymentQueueItem = {
  /** Stable unique React key and transition target; never a display reference. */
  paymentId: string;
  traineeName: string;
  programNames: string[];
  amount: number;
  paymentMethod: PaymentMethod;
  referenceCode: string;
  status: "SUBMITTED" | "VERIFIED" | "REJECTED";
  submittedAt: Date;
  reviewedAt: Date | null;
};

export type AdminPaymentQueueResult = AdminQueuePage<AdminPaymentQueueItem> & {
  summary: { pending: number; verified: number; rejected: number; missingProof: number };
};

/**
 * A page contains only action-ready SUBMITTED payments or terminal review
 * history, never both. `requireRole` makes this a verified server boundary
 * even if another component later reuses the read outside the admin page.
 */
export async function getAdminPaymentQueue(params: AdminOperationalQueueParams = {}): Promise<AdminPaymentQueueResult> {
  await requireRole("ADMIN");
  const normalized = normalizeAdminQueueParams(params);
  const summaryPromise = Promise.all([
    enrollmentPaymentRepository.countByStatus("SUBMITTED"),
    enrollmentPaymentRepository.countByStatus("VERIFIED"),
    enrollmentPaymentRepository.countByStatus("REJECTED"),
    enrollmentPaymentRepository.countMissingProofForStatuses(["SUBMITTED"]),
  ]);
  if (normalized.invalid) {
    const [pending, verified, rejected, missingProof] = await summaryPromise;
    return { ...emptyAdminQueue<AdminPaymentQueueItem>(), summary: { pending, verified, rejected, missingProof } };
  }
  const parsedStatus = paymentQueueStatusSchema.safeParse(params.status ?? "ALL");
  if (!parsedStatus.success) {
    const [pending, verified, rejected, missingProof] = await summaryPromise;
    return { ...emptyAdminQueue<AdminPaymentQueueItem>(), summary: { pending, verified, rejected, missingProof } };
  }
  const defaultStatuses = normalized.view === "queue" ? ["SUBMITTED"] as const : ["VERIFIED", "REJECTED"] as const;
  const allowedStatuses = parsedStatus.data === "ALL" ? defaultStatuses : parsedStatus.data === "SUBMITTED" && normalized.view === "queue" ? ["SUBMITTED"] as const : parsedStatus.data !== "SUBMITTED" && normalized.view === "history" ? [parsedStatus.data] as const : null;
  if (!allowedStatuses) {
    const [pending, verified, rejected, missingProof] = await summaryPromise;
    return { ...emptyAdminQueue<AdminPaymentQueueItem>(), summary: { pending, verified, rejected, missingProof } };
  }
  const filter = {
    statuses: [...allowedStatuses],
    search: normalized.search,
    programId: normalized.programId,
    submittedFrom: normalized.from,
    submittedBefore: normalized.before,
  };
  const [total, summary] = await Promise.all([enrollmentPaymentRepository.countForAdminQueue(filter), summaryPromise]);
  const pagination = adminQueuePagination(total, normalized.page, ADMIN_QUEUE_PAGE_SIZE);
  const rows = await enrollmentPaymentRepository.findManyForAdminQueue({ ...filter, skip: pagination.skip, take: ADMIN_QUEUE_PAGE_SIZE });
  return {
    items: rows.map((row) => ({
      paymentId: row.id,
      traineeName: `${row.trainee.firstName} ${row.trainee.lastName}`,
      programNames: row.enrollments.map((enrollment) => enrollment.program.shortName),
      amount: Number(row.totalAmount),
      paymentMethod: row.paymentMethod,
      referenceCode: row.referenceCode,
      status: row.status,
      submittedAt: row.submittedAt,
      reviewedAt: row.verifiedAt ?? row.rejectedAt,
    })),
    total,
    page: pagination.page,
    pageSize: ADMIN_QUEUE_PAGE_SIZE,
    totalPages: pagination.totalPages,
    summary: { pending: summary[0], verified: summary[1], rejected: summary[2], missingProof: summary[3] },
  };
}

export type AdminCertificateQueueItem = {
  /** Stable unique React key and transition target; never certificateCode. */
  certificateRequestId: string;
  traineeName: string;
  certificateCode: string;
  programName: string;
  trainerName: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  completedAt: Date;
  requestedAt: Date;
  reviewedAt: Date | null;
};

export type AdminCertificateQueueResult = AdminQueuePage<AdminCertificateQueueItem> & {
  summary: { pending: number; approved: number; rejected: number };
};

export async function getAdminCertificateQueue(params: AdminOperationalQueueParams = {}): Promise<AdminCertificateQueueResult> {
  await requireRole("ADMIN");
  const normalized = normalizeAdminQueueParams(params);
  const summaryPromise = Promise.all([
    certificateRequestRepository.countByStatus("PENDING"),
    certificateRequestRepository.countByStatus("APPROVED"),
    certificateRequestRepository.countByStatus("REJECTED"),
  ]);
  if (normalized.invalid) {
    const [pending, approved, rejected] = await summaryPromise;
    return { ...emptyAdminQueue<AdminCertificateQueueItem>(), summary: { pending, approved, rejected } };
  }
  const parsedStatus = certificateQueueStatusSchema.safeParse(params.status ?? "ALL");
  if (!parsedStatus.success) {
    const [pending, approved, rejected] = await summaryPromise;
    return { ...emptyAdminQueue<AdminCertificateQueueItem>(), summary: { pending, approved, rejected } };
  }
  const defaultStatuses = normalized.view === "queue" ? ["PENDING"] as const : ["APPROVED", "REJECTED"] as const;
  const statuses = parsedStatus.data === "ALL" ? defaultStatuses : parsedStatus.data === "PENDING" && normalized.view === "queue" ? ["PENDING"] as const : parsedStatus.data !== "PENDING" && normalized.view === "history" ? [parsedStatus.data] : null;
  if (!statuses) {
    const [pending, approved, rejected] = await summaryPromise;
    return { ...emptyAdminQueue<AdminCertificateQueueItem>(), summary: { pending, approved, rejected } };
  }
  const filter = { statuses: [...statuses], search: normalized.search, programId: normalized.programId, requestedFrom: normalized.from, requestedBefore: normalized.before };
  const [total, summary] = await Promise.all([certificateRequestRepository.countForAdminQueue(filter), summaryPromise]);
  const pagination = adminQueuePagination(total, normalized.page, ADMIN_QUEUE_PAGE_SIZE);
  const rows = await certificateRequestRepository.findManyForAdminQueue({ ...filter, skip: pagination.skip, take: ADMIN_QUEUE_PAGE_SIZE });
  return {
    items: rows.map((row) => ({
      certificateRequestId: row.id,
      traineeName: `${row.enrollment.trainee.firstName} ${row.enrollment.trainee.lastName}`,
      certificateCode: row.certificateCode,
      programName: row.enrollment.program.shortName,
      trainerName: row.enrollment.batch?.trainer ? `${row.enrollment.batch.trainer.firstName} ${row.enrollment.batch.trainer.lastName}` : null,
      status: row.status,
      completedAt: row.completedAt,
      requestedAt: row.requestedAt,
      reviewedAt: row.approvedAt,
    })),
    total,
    page: pagination.page,
    pageSize: ADMIN_QUEUE_PAGE_SIZE,
    totalPages: pagination.totalPages,
    summary: { pending: summary[0], approved: summary[1], rejected: summary[2] },
  };
}

/** Minimal, non-sensitive labels for the program filter. */
export async function getAdminQueuePrograms(): Promise<{ id: string; shortName: string }[]> {
  await requireRole("ADMIN");
  return programRepository.findAllQueueOptions();
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

// The list previously ran `findManyWithProgramContext()` with no `take` at
// all — every row, every load (see the DEFECT-USER-LIST brief this change
// ships under: 23 seeded users already produced 8.8 screens of scroll at
// 390x844, and the same code path would ship ~1000 rows verbatim at that
// scale). These are the boundary schemas for the fix. They live here rather
// than in src/server/schemas/dashboard.schema.ts because this change's file
// ownership is scoped to user.repository.ts / dashboard.service.ts /
// admin/page.tsx / features/dashboard-admin/** only — the schemas file is
// out of that scope, not because schemas belong in a service by default.
// 6, not a rounder 10 or 20: measured against the <md mobile card layout
// (UserManagementCard renders at 298px tall on a 390px-wide viewport, 12px
// gap between cards). 6 cards + the page header/filters/pagination chrome
// keeps document.scrollHeight at ~2243px on a 390x844 viewport — under the
// 3-viewport-height (2532px) ceiling with real margin; 7 cards measured to
// ~2553px, over budget. One page size for both breakpoints (no
// desktop-vs-mobile branching) per KISS — the >=md table has no analogous
// scroll constraint, so this is set by the tighter of the two layouts.
const DEFAULT_ADMIN_USER_LIST_PAGE_SIZE = 6;
const MAX_ADMIN_USER_LIST_PAGE_SIZE = 50;

// `.catch()` (not `.safeParse()` + a manual fallback) because an
// out-of-range or malformed page/pageSize is a UI-recoverable input, not a
// rejection case: a page number arriving as "abc", "-5", or "99999" must
// clamp to a safe value rather than be trusted or 404 the whole list
// (.claude/rules/00-non-negotiables.md rule 3, "fail closed" — for a list
// read, closed means "the smallest safe page", not "every row").
const adminUserListPageSchema = z.coerce.number().int().min(1).catch(1);
const adminUserListPageSizeSchema = z.coerce
  .number()
  .int()
  .min(1)
  .max(MAX_ADMIN_USER_LIST_PAGE_SIZE) // never let a client request more than this many rows in one page
  .catch(DEFAULT_ADMIN_USER_LIST_PAGE_SIZE);
const adminUserListSearchSchema = z.string().trim().max(200).catch("");
/** Strict — unlike the schemas above, an unrecognized role is NOT a typo to clamp past. See the fail-closed branch in `getAdminUserList` below. */
const adminUserListRoleSchema = z.enum(["TRAINEE", "TRAINER", "ADMIN"]);

/** The user management role filter's "no filter" option — distinct from `undefined` only so the URL can carry it explicitly (`?role=ALL`) the same way it carries any other param. */
const ADMIN_USER_LIST_ALL_ROLES = "ALL";

export type AdminUserListParams = {
  page?: string | number;
  pageSize?: string | number;
  search?: string;
  /** Raw, untrusted query value. Anything other than a real `UserRole` or `"ALL"`/`undefined` fails closed — see below. */
  role?: string;
};

export type AdminUserListResult = {
  users: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/**
 * Admin-only — see the note on `getAdminPendingEnrollmentQueue` above. Never
 * returns `passwordHash`.
 *
 * Server-side pagination + search/role filtering, all applied to the same
 * `WHERE` the total count is computed against — a search for a user on
 * page 3 works with no client-side re-fetch of "everything" first, and
 * filtering never silently narrows to just the rows already on screen.
 * `page` is clamped into `[1, totalPages]` *after* the filtered count is
 * known, so a stale/forged page number from a wider result set can't
 * request an out-of-range offset.
 */
export async function getAdminUserList(params: AdminUserListParams = {}): Promise<AdminUserListResult> {
  const pageSize = adminUserListPageSizeSchema.parse(params.pageSize);
  const requestedPage = adminUserListPageSchema.parse(params.page);
  const search = adminUserListSearchSchema.parse(params.search ?? "");

  let role: UserRole | undefined;
  if (params.role !== undefined && params.role !== ADMIN_USER_LIST_ALL_ROLES) {
    const parsedRole = adminUserListRoleSchema.safeParse(params.role);
    if (!parsedRole.success) {
      // Fail closed: an unrecognized role filter must never fall through to
      // "show everyone" — same precedent as getAdminAuditLog's category
      // guard above. This is a list read, not an auth gate, so the closed
      // state is a legitimate, empty first page rather than a throw.
      return { users: [], total: 0, page: 1, pageSize, totalPages: 1 };
    }
    role = parsedRole.data;
  }

  const filter = { search: search.length > 0 ? search : undefined, role };
  const total = await userRepository.countUsersWithFilter(filter);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const skip = (page - 1) * pageSize;

  const users = await userRepository.findManyWithProgramContext({ skip, take: pageSize, ...filter });

  return {
    users: users.map((user) => {
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
    }),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Admin — Trainer Management (desktop-02.md #8)
// ---------------------------------------------------------------------------

export type TrainerRosterTrainee = { id: string; enrollmentId: string; batchId: string; name: string; program: string };

export type AdminUnassignedEnrollmentItem = {
  enrollmentId: string;
  traineeName: string;
  programName: string;
  eligibleBatches: { id: string; label: string; trainerName: string }[];
};

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

/** Active enrollments waiting for an administrator to attach them to a
 * matching trainer batch. Batch eligibility is derived on the server so the
 * client never decides which program relationship is valid. */
export async function getAdminUnassignedActiveEnrollments(): Promise<AdminUnassignedEnrollmentItem[]> {
  const [enrollments, batches] = await Promise.all([
    enrollmentRepository.findManyActiveUnassigned(),
    batchRepository.findManyWithProgramAndTrainer(),
  ]);
  const batchesByProgram = new Map<string, AdminUnassignedEnrollmentItem["eligibleBatches"]>();
  for (const batch of batches) {
    const candidates = batchesByProgram.get(batch.programId) ?? [];
    candidates.push({
      id: batch.id,
      label: batch.code,
      trainerName: `${batch.trainer.firstName} ${batch.trainer.lastName}`,
    });
    batchesByProgram.set(batch.programId, candidates);
  }
  return enrollments.map((enrollment) => ({
    enrollmentId: enrollment.id,
    traineeName: `${enrollment.trainee.firstName} ${enrollment.trainee.lastName}`,
    programName: enrollment.program.shortName,
    eligibleBatches: batchesByProgram.get(enrollment.programId) ?? [],
  }));
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
  enrollmentId: string;
  name: string;
  email: string;
  progressPercent: number;
  isPaid: boolean;
  isTrained: boolean;
  isCompleted: boolean;
};

/**
 * Viewer-scoped: `viewerRole` must be TRAINER, and the roster returned is
 * always the *viewer's own* trainees across every batch they own — there is
 * no id parameter to spoof another trainer's roster with. Any
 * other role fails closed to an empty array.
 */
export async function getTrainerTraineeRoster(
  viewerId: string,
  viewerRole: UserRole,
): Promise<TrainerTraineeRosterItem[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return []; // fail closed

  const trainerId = parsedId.data;
  const enrollments = await enrollmentRepository.findManyByTrainerId(trainerId);
  const evaluations = await evaluationRepository.findManyActiveByEnrollmentIds(
    enrollments.map((enrollment) => enrollment.id),
  );
  const trainedEnrollmentIds = new Set(evaluations.map((evaluation) => evaluation.enrollmentId));

  return enrollments.map((enrollment) => ({
    id: enrollment.trainee.id,
    enrollmentId: enrollment.id,
    name: `${enrollment.trainee.firstName} ${enrollment.trainee.lastName}`,
    email: enrollment.trainee.email,
    progressPercent: enrollment.progressPercent,
    isPaid: enrollment.payment.status === "VERIFIED",
    isTrained: trainedEnrollmentIds.has(enrollment.id),
    isCompleted: enrollment.status === "COMPLETED",
  }));
}

export type TrainerBatchOption = { id: string; label: string; programName: string };

/** Viewer-scoped batch choices for a trainer's assignment composer. */
export async function getTrainerBatchOptions(viewerId: string, viewerRole: UserRole): Promise<TrainerBatchOption[]> {
  const parsedId = userIdSchema.safeParse(viewerId);
  if (!parsedId.success || viewerRole !== "TRAINER") return [];
  const batches = await batchRepository.findManyByTrainerId(parsedId.data);
  return batches.map((batch) => ({ id: batch.id, label: batch.code, programName: batch.program.shortName }));
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

export type TraineeAssignmentSubmissionState = {
  submittedAt: Date;
  delivery:
    | { state: "READY"; url: string; type: SubmissionType }
    | { state: "PROCESSING"; type: SubmissionType }
    | { state: "LEGACY"; url: string | null };
};

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
      submission: submission ? toTraineeAssignmentSubmissionState(submission) : null,
    };
  });
}

/** New rows always own a MediaAsset. The old URL field is read only for rows
 * predating that relation, so no newly uploaded assignment can surface a
 * client-supplied link. */
function toTraineeAssignmentSubmissionState(submission: {
  submissionLink: string;
  submittedAt: Date;
  mediaAsset: { url: string | null; resourceType: MediaResourceType; purgeState: string } | null;
}): TraineeAssignmentSubmissionState {
  if (!submission.mediaAsset) {
    return {
      submittedAt: submission.submittedAt,
      delivery: { state: "LEGACY", url: isSafeHttpUrl(submission.submissionLink) ? submission.submissionLink : null },
    };
  }

  const type = submissionTypeForMediaResource(submission.mediaAsset.resourceType);
  if (submission.mediaAsset.purgeState === "ACTIVE" && submission.mediaAsset.url) {
    return { submittedAt: submission.submittedAt, delivery: { state: "READY", url: submission.mediaAsset.url, type } };
  }
  return { submittedAt: submission.submittedAt, delivery: { state: "PROCESSING", type } };
}

/** Legacy rows may predate MediaAsset ownership. Preserve only absolute
 * http(s) links; malformed, relative, and script URLs are unavailable. */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function submissionTypeForMediaResource(resourceType: MediaResourceType): SubmissionType {
  switch (resourceType) {
    case "IMAGE":
      return "IMAGE";
    case "VIDEO":
      return "VIDEO";
    case "RAW":
      return "DOCUMENT";
    default: {
      const _exhaustive: never = resourceType;
      return _exhaustive;
    }
  }
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
  delivery:
    | { state: "READY"; url: string }
    | { state: "PROCESSING" }
    | { state: "UNAVAILABLE" };
};

/** Viewer-scoped: only active modules for the calling TRAINEE's own active
 * enrollment. Assets are authoritative only when ACTIVE and attached. */
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
    delivery: module.mediaAsset?.purgeState === "ACTIVE" && module.mediaAsset.url
      ? { state: "READY" as const, url: module.mediaAsset.url }
      : module.mediaAsset?.purgeState === "RESERVED"
        ? { state: "PROCESSING" as const }
        : { state: "UNAVAILABLE" as const },
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
