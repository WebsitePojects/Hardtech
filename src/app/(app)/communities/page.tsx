import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/layout/footer";
import { CommunitiesBrowser } from "@/features/communities/communities-browser";
import type { CommunityTopic } from "@/../generated/prisma/enums";

// NOT SOURCED: no screenshot captures a standalone /communities page distinct
// from /forum's embedded "Communities" tab (desktop-02.md #28-29) — the
// route is named in docs/research/01-design-source.md's route map but the
// screenshot corpus only shows the tab. This reuses the exact same browsing
// surface (CommunitiesBrowser) rather than inventing a different layout for
// content that's otherwise identical, per .claude/rules/20-design-fidelity.md
// ("if the screenshots do not contain it, mark it NOT SOURCED").
//
// Cannot find module '@/server/services/forum.service' is expected until
// DATA-2 lands it — see src/app/(app)/forum/page.tsx for the contract
// disclaimer. Expected shape:
//   listCommunities({ search?, region?, topic? }): Promise<CommunitySummary[]>
import { listCommunities } from "@/server/services/forum.service";

export const metadata = {
  title: "Communities | HardTech IT Corp",
};

interface CommunitiesPageSearchParams {
  search?: string;
  region?: string;
  topic?: string;
}

const VALID_TOPICS: CommunityTopic[] = [
  "MOBILE_REPAIR",
  "DESKTOP_REPAIR",
  "NETWORKING",
  "TROUBLESHOOTING",
];
function parseTopic(value: string | undefined): CommunityTopic | undefined {
  return VALID_TOPICS.includes(value as CommunityTopic) ? (value as CommunityTopic) : undefined;
}

export default async function CommunitiesPage(props: {
  searchParams: Promise<CommunitiesPageSearchParams>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search?.trim() || undefined;
  const region = searchParams.region?.trim() || undefined;
  const topic = parseTopic(searchParams.topic);

  const communities = await listCommunities();

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-24 pb-16 sm:px-6 sm:pt-28">
        <div className="space-y-2">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Community
          </Badge>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Regional <span className="text-primary">Communities</span>
          </h1>
          <p className="text-muted-foreground">
            Region-scoped groups for technicians, freelancers, and trainees near you.
          </p>
        </div>

        <CommunitiesBrowser communities={communities} search={search} region={region} topic={topic} />
      </div>
      <Footer />
    </>
  );
}
