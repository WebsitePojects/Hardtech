import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/layout/footer";
import { PostCard } from "@/features/forum/post-card";
import { JoinButton } from "@/features/communities/join-button";
import { COMMUNITY_TOPIC_LABELS } from "@/features/communities/types";
import { TOPIC_ICONS } from "@/features/communities/topic-meta";

// NOT SOURCED: no screenshot in docs/screens/ captures an individual
// community's detail page — only the /forum "Communities" tab grid
// (desktop-02.md #28-29) and the route literal `/communities/:slug` (e.g.
// `iloilo-it-community`) from docs/research/01-design-source.md's route map.
// This composes the confirmed pieces (community card header fields, rules
// array from the schema, the same PostCard used everywhere else) rather than
// inventing new visual language for the parts that aren't sourced.
//
// Cannot find module '@/server/services/forum.service' is expected until
// DATA-2 lands it — see src/app/(app)/forum/page.tsx for the contract
// disclaimer. Expected shape:
//   getCommunityBySlug(slug: string, currentUserId?: string): Promise<CommunityDetail | null>
import { getSession } from "@/server/auth/session";
import { getCommunityBySlug } from "@/server/services/forum.service";

export default async function CommunityDetailPage(props: PageProps<"/communities/[slug]">) {
  const { slug } = await props.params;
  const session = await getSession();
  const community = await getCommunityBySlug(slug, session?.userId);

  if (!community) notFound();

  const TopicIcon = community.primaryTopic ? TOPIC_ICONS[community.primaryTopic] : null;

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
        <Link
          href="/communities"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> Communities
        </Link>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl font-bold text-foreground">{community.name}</h1>
                  <Badge variant="outline">
                    {community.visibility === "PUBLIC" ? "🌐 PUBLIC" : "🔒 PRIVATE"}
                  </Badge>
                </div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" aria-hidden />
                  {community.region}
                </p>
              </div>
              <JoinButton communityId={community.id} isJoined={community.viewerMembershipStatus === "APPROVED"} />
            </div>

            <p className="text-sm text-muted-foreground">{community.description}</p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" aria-hidden /> {community.memberCount} members
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="size-4" aria-hidden /> {community.replyCount} replies
              </span>
              {community.primaryTopic ? (
                <Badge variant="outline" className="gap-1">
                  {TopicIcon ? <TopicIcon className="size-3" aria-hidden /> : null}
                  {COMMUNITY_TOPIC_LABELS[community.primaryTopic]}
                </Badge>
              ) : null}
            </div>

            {community.rules.length > 0 ? (
              <div className="space-y-1.5 border-t border-glass-border pt-3">
                <h2 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                  Community Rules
                </h2>
                <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground marker:text-primary">
                  {community.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ol>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">Posts</h2>
          {community.posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
              No posts in this community yet.
            </div>
          ) : (
            community.posts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
