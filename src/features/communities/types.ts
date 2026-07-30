import type { CommunityTopic } from "@/../generated/prisma/enums";
import type {
  CommunityDetail as ServiceCommunityDetail,
  CommunityListItem,
} from "@/server/services/forum.service";

export type CommunitySummary = CommunityListItem;
export type CommunityDetail = ServiceCommunityDetail;

/** Verbatim from desktop-01.md / desktop-02.md #28-29. */
export const COMMUNITY_TOPIC_LABELS: Record<CommunityTopic, string> = {
  MOBILE_REPAIR: "Mobile Repair",
  DESKTOP_REPAIR: "Desktop Repair",
  NETWORKING: "Networking",
  TROUBLESHOOTING: "Troubleshooting",
};

/**
 * The 9 communities named in desktop-02.md #29 and confirmed again in
 * docs/research/01-design-source.md. Used only to derive the region filter's
 * option list client-side from whatever the service returns - never to
 * fabricate data; if the service returns none of these, none render.
 */
export const KNOWN_COMMUNITY_NAMES = [
  "NCR / Metro Manila Technicians",
  "Quezon City Repair Hub",
  "Cavite Technicians",
  "Cebu Techs Network",
  "Davao Tech Circle",
  "Laguna Tech Collective",
  "Pampanga Repair Pros",
  "Batangas Tech Hub",
  "Iloilo IT Community",
] as const;
