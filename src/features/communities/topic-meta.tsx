import { Monitor, Smartphone, Wifi, Wrench, type LucideIcon } from "lucide-react";

import type { CommunityTopic } from "@/../generated/prisma/enums";

/** Topic tag icon (desktop-02.md #29 topic Badge column). */
export const TOPIC_ICONS: Record<CommunityTopic, LucideIcon> = {
  MOBILE_REPAIR: Smartphone,
  DESKTOP_REPAIR: Monitor,
  NETWORKING: Wifi,
  TROUBLESHOOTING: Wrench,
};
