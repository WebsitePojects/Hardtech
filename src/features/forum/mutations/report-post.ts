"use server";

import { reportPostAction } from "@/app/(app)/forum/actions";
import type { ReportReason } from "@/../generated/prisma/enums";

export interface ReportPostInput {
  idempotencyKey: string;
  postId: string;
  reason: ReportReason;
  note?: string;
}

export async function reportPost(input: ReportPostInput) {
  return reportPostAction(input);
}
