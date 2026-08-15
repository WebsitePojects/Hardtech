import { programRepository } from "@/server/repositories/program.repository";
import { trainerProfileRepository } from "@/server/repositories/trainer-profile.repository";
import { testimonialRepository } from "@/server/repositories/testimonial.repository";
import { galleryPhotoRepository } from "@/server/repositories/gallery-photo.repository";
import { faqRepository } from "@/server/repositories/faq.repository";
import { paymentMethodRepository } from "@/server/repositories/payment-method.repository";
import { announcementRepository } from "@/server/repositories/announcement.repository";
import { programShortNameSchema } from "@/server/schemas/marketing.schema";
import type {
  Program,
  ProgramCurriculumTopic,
  TrainerProfile,
  User,
  Testimonial,
  GalleryPhoto,
  Faq,
  PaymentMethodConfig,
} from "@/../generated/prisma/client";
import type { AnnouncementType, MediaType } from "@/../generated/prisma/enums";

/**
 * The one module route builders are allowed to import for marketing content
 * (docs/contracts/wave-1-marketing.md). Business rules live here, not in the
 * repositories: which trainer statuses count as "public", which payment
 * methods are eligible to show at checkout, and boundary validation of
 * caller-supplied input.
 */

export type ProgramWithCurriculum = Program & {
  curriculumTopics: ProgramCurriculumTopic[];
};
export type TrainerWithUser = TrainerProfile & { user: User };
export type PublicAnnouncement = {
  id: string; title: string; body: string; type: AnnouncementType;
  mediaUrl: string | null; mediaType: MediaType | null; isPinned: boolean;
  postedByName: string; createdAt: Date;
};

export async function getPublicAnnouncement(id: string): Promise<PublicAnnouncement | null> {
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return null;
  const row = await announcementRepository.findById(id);
  if (!row) return null;
  return { id: row.id, title: row.title, body: row.body, type: row.type, mediaUrl: row.mediaUrl, mediaType: row.mediaType, isPinned: row.isPinned, postedByName: `${row.postedBy.firstName} ${row.postedBy.lastName}`, createdAt: row.createdAt };
}

export function getPrograms(): Promise<ProgramWithCurriculum[]> {
  return programRepository.findAll();
}

export async function getProgramByShortName(
  shortName: string,
): Promise<ProgramWithCurriculum | null> {
  const parsed = programShortNameSchema.safeParse(shortName);
  if (!parsed.success) {
    // Fail closed: an unparseable identifier is treated as "not found",
    // never as "fetch everything" or a thrown 500.
    return null;
  }
  return programRepository.findByShortName(parsed.data);
}

export function getTrainers(): Promise<TrainerWithUser[]> {
  // Only trainers whose status is ACTIVE are eligible to appear on the
  // public site — ON_LEAVE and SUSPENDED trainers are excluded here, not in
  // the repository.
  return trainerProfileRepository.findManyByStatus("ACTIVE");
}

export function getTestimonials(): Promise<Testimonial[]> {
  return testimonialRepository.findAllOrdered();
}

export function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  return galleryPhotoRepository.findAllOrdered();
}

export function getFaqs(): Promise<Faq[]> {
  return faqRepository.findAllOrdered();
}

export function getPaymentMethods(): Promise<PaymentMethodConfig[]> {
  // Only methods an admin has enabled are eligible to show at checkout.
  return paymentMethodRepository.findManyByEnabled(true);
}
