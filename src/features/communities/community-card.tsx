import Link from "next/link";
import { MapPin, MessageCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { JoinButton } from "./join-button";
import { COMMUNITY_TOPIC_LABELS } from "./types";
import { TOPIC_ICONS } from "./topic-meta";
import type { CommunitySummary } from "./types";

/**
 * One community card in the "Recommended for you" grid (desktop-02.md #29):
 * gradient banner + icon avatar, PUBLIC/PRIVATE badge, name, location,
 * description, topic tag, member/reply counts, Join button.
 *
 * The source shows a distinct illustrated banner image per card; none of
 * those images are sourced (no asset URLs in docs/research/01-design-source.md
 * beyond the one Unsplash photo used elsewhere), so this renders a flat
 * brand-toned gradient instead of inventing artwork.
 */
export function CommunityCard({ community }: { community: CommunitySummary }) {
  const TopicIcon = community.primaryTopic ? TOPIC_ICONS[community.primaryTopic] : null;

  return (
    <Card className="overflow-hidden border border-glass-border bg-surface-card ring-0 transition-[border-color,box-shadow,transform] motion-reduce:transition-none lg:hover:-translate-y-1 lg:hover:border-[var(--glass-border-strong)] lg:hover:shadow-glow-sm">
      <div className="relative h-[92px] bg-gradient-to-br from-primary/30 via-brand-blue/20 to-brand-purple/20">
        <span className="absolute top-3 right-3">
          <Badge variant="outline" className="border-glass-border bg-glass text-foreground">
            {community.visibility === "PUBLIC" ? "🌐 PUBLIC" : "🔒 PRIVATE"}
          </Badge>
        </span>
        <span className="absolute -bottom-4 left-4 flex size-11 items-center justify-center rounded-full border border-glass-border bg-surface-card text-lg">
          {TopicIcon ? <TopicIcon className="size-5 text-primary" aria-hidden /> : "🏘️"}
        </span>
      </div>
      <CardContent className="space-y-2 p-4 pt-7">
        <Link href={`/communities/${community.slug}`}>
          <h3 className="font-heading text-sm font-semibold text-foreground hover:text-primary">
            {community.name}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden />
          {community.region}
        </p>
        <p className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{community.description}</p>

        {community.primaryTopic ? (
          <Badge variant="outline" className="gap-1">
            {TopicIcon ? <TopicIcon className="size-3" aria-hidden /> : null}
            {COMMUNITY_TOPIC_LABELS[community.primaryTopic]}
          </Badge>
        ) : null}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" aria-hidden />
              {community.memberCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="size-3.5" aria-hidden />
              {community.replyCount}
            </span>
          </div>
          <JoinButton communityId={community.id} isJoined={community.viewerMembershipStatus === "APPROVED"} />
        </div>
      </CardContent>
    </Card>
  );
}
