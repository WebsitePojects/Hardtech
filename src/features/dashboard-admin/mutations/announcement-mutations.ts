// TODO(wave-4): see enrollment-mutations.ts / src/features/enroll/submit-enrollment.ts
// for the pattern this follows. "Post Announcement" (desktop-02.md #10) is
// a create, not a state transition, so it needs the same client-minted
// idempotency key as /enroll (rule 1: minted once per user intent, when
// the form mounts, not per submit attempt — see announcement-form.tsx) so
// a retried request replays the original announcement instead of
// duplicating it (rule 2: idempotency-key store). "Post Announcement" is
// rendered disabled until the required fields are filled (desktop-02.md
// #10's screenshot shows it grey/disabled on an empty form) — that is a
// completeness guard, separate from and in addition to the pending guard.
//
// "Delete" (desktop-02.md #10's trash icon) is a plain delete-by-id, safe
// to guard the same way as removeUser in user-mutations.ts.

import type { AnnouncementType, MediaType } from "@/../generated/prisma/enums";

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

export async function postAnnouncement(input: PostAnnouncementInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): posting an announcement is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}

export async function deleteAnnouncement(input: DeleteAnnouncementInput): Promise<never> {
  void input;
  throw new Error(
    "TODO(wave-4): deleting an announcement is not implemented yet. " +
      "This build stops at the disabled/pending guard on purpose.",
  );
}
