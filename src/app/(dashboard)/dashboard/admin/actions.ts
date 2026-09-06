"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/server/auth/session";
import { certificateTransitionSchema, paymentTransitionSchema } from "@/server/schemas/dashboard-write.schema";
import { moderateForumPostSchema } from "@/server/schemas/forum-write.schema";
import { approveCertificate, rejectCertificate, verifyPayment, rejectPayment } from "@/server/services/dashboard-write.service";
import { approveForumPost, rejectForumPost } from "@/server/services/forum-write.service";
import { createAnnouncement, deleteAnnouncement } from "@/server/services/announcement-write.service";
import { announcementWriteSchema, deleteAnnouncementSchema } from "@/server/schemas/dashboard-write.schema";
import { assignEnrollmentToBatchSchema, removeAssignedTraineeSchema, removeUserSchema, savePaymentMethodSchema, updateUserProgramSchema, updateUserRoleSchema, updateUserStatusSchema } from "@/server/schemas/admin-write.schema";
import { assignEnrollmentToBatch, removeAssignedTrainee, removeUser, savePaymentMethod, updateUserProgram, updateUserRole, updateUserStatus } from "@/server/services/admin-write.service";

async function adminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
}

export async function createAnnouncementAction(input: unknown) {
  const parsed = announcementWriteSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid announcement." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await createAnnouncement({ ...parsed.data, authorId: session.userId, authorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function deleteAnnouncementAction(input: unknown) {
  const parsed = deleteAnnouncementSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid announcement." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await deleteAnnouncement({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function approveCertificateAction(input: unknown) {
  const parsed = certificateTransitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid certificate request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await approveCertificate({ adminId: session.userId, adminRole: session.role, certificateRequestId: parsed.data.certificateRequestId });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function rejectCertificateAction(input: unknown) {
  const parsed = certificateTransitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid certificate request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await rejectCertificate({ adminId: session.userId, adminRole: session.role, certificateRequestId: parsed.data.certificateRequestId, reason: parsed.data.reason });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function verifyPaymentAction(input: unknown) {
  const parsed = paymentTransitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid payment." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await verifyPayment({ adminId: session.userId, adminRole: session.role, paymentId: parsed.data.paymentId });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function rejectPaymentAction(input: unknown) {
  const parsed = paymentTransitionSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid payment." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await rejectPayment({ adminId: session.userId, adminRole: session.role, paymentId: parsed.data.paymentId, reason: parsed.data.reason });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function approveForumPostAction(input: unknown) {
  const parsed = moderateForumPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid forum post." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await approveForumPost({ postId: parsed.data.postId, moderatorId: session.userId, moderatorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function rejectForumPostAction(input: unknown) {
  const parsed = moderateForumPostSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid forum post." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await rejectForumPost({ postId: parsed.data.postId, moderatorId: session.userId, moderatorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function updateUserRoleAction(input: unknown) {
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid user role request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await updateUserRole({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function updateUserProgramAction(input: unknown) {
  const parsed = updateUserProgramSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid user program request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await updateUserProgram({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function updateUserStatusAction(input: unknown) {
  const parsed = updateUserStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid user status request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await updateUserStatus({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function removeUserAction(input: unknown) {
  const parsed = removeUserSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid user request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await removeUser({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function removeAssignedTraineeAction(input: unknown) {
  const parsed = removeAssignedTraineeSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid trainee assignment request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await removeAssignedTrainee({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function assignEnrollmentToBatchAction(input: unknown) {
  const parsed = assignEnrollmentToBatchSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid batch assignment request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await assignEnrollmentToBatch({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}

export async function savePaymentMethodAction(input: unknown) {
  const parsed = savePaymentMethodSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid payment method request." };
  const session = await adminSession();
  if (!session) return { ok: false as const, error: "Not authorized." };
  const result = await savePaymentMethod({ ...parsed.data, actorId: session.userId, actorRole: session.role });
  if (result.ok) updateTag("dashboard");
  return result;
}
