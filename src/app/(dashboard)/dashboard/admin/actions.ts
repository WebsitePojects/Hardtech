"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/server/auth/session";
import { certificateTransitionSchema, paymentTransitionSchema } from "@/server/schemas/dashboard-write.schema";
import { moderateForumPostSchema } from "@/server/schemas/forum-write.schema";
import { approveCertificate, rejectCertificate, verifyPayment, rejectPayment } from "@/server/services/dashboard-write.service";
import { approveForumPost, rejectForumPost } from "@/server/services/forum-write.service";

async function adminSession() {
  const session = await getSession();
  return session?.role === "ADMIN" ? session : null;
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
