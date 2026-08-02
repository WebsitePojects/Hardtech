"use server";

import type { AnnouncementType, MediaType } from "@/../generated/prisma/enums";
import { requireRole } from "@/server/auth/session";
import {
  createAnnouncement as createAnnouncementService,
  deleteAnnouncement as deleteAnnouncementService,
} from "@/server/services/announcement-write.service";

export interface PostAnnouncementInput {
  idempotencyKey: string;
  title: string;
  body: string;
  type: AnnouncementType;
  isPinned: boolean;
  media: { file: File; type: MediaType } | null;
}

export interface DeleteAnnouncementInput {
  announcementId: string;
}

export async function postAnnouncement(input: PostAnnouncementInput): Promise<void> {
  const session = await requireRole("ADMIN");
  const result = await createAnnouncementService({
    title: input.title,
    body: input.body,
    type: input.type,
    pinned: input.isPinned,
    authorId: session.userId,
    authorRole: session.role,
    idempotencyKey: input.idempotencyKey,
  });

  if (!result.ok) throw new Error(result.error);
}

export async function deleteAnnouncement(input: DeleteAnnouncementInput): Promise<void> {
  const session = await requireRole("ADMIN");
  const result = await deleteAnnouncementService({
    announcementId: input.announcementId,
    actorId: session.userId,
    actorRole: session.role,
  });

  if (!result.ok) throw new Error(result.error);
}
