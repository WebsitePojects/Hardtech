import type { AnnouncementType, UserRole } from "@/../generated/prisma/enums";
import { announcementRepository } from "@/server/repositories/announcement.repository";
import { userRepository } from "@/server/repositories/user.repository";

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function createAnnouncement(input: { title: string; body: string; type: AnnouncementType; pinned: boolean; authorId: string; authorRole: UserRole; idempotencyKey: string }): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const actor = await userRepository.findById(input.authorId);
  if (input.authorRole !== "ADMIN" || actor?.role !== "ADMIN") return { ok: false, error: "Not authorized." };
  try {
    const announcement = await announcementRepository.create(input);
    return { ok: true, id: announcement.id };
  } catch (error) {
    if (!isUniqueViolation(error)) return { ok: false, error: "Unable to create announcement." };
    const existing = await announcementRepository.findByIdempotencyKey(input.idempotencyKey);
    return existing ? { ok: true, id: existing.id } : { ok: false, error: "Unable to create announcement." };
  }
}

export async function deleteAnnouncement(input: { announcementId: string; actorId: string; actorRole: UserRole }): Promise<{ ok: true } | { ok: false; error: string }> {
  const actor = await userRepository.findById(input.actorId);
  if (input.actorRole !== "ADMIN" || actor?.role !== "ADMIN") return { ok: false, error: "Not authorized." };
  try {
    await announcementRepository.deleteById(input.announcementId);
    return { ok: true };
  } catch {
    return { ok: false, error: "Announcement not found." };
  }
}
