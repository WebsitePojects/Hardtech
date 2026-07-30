import { CommunitiesToolbar } from "./communities-toolbar";
import { CommunityCard } from "./community-card";
import { RegionBanner } from "./region-banner";
import { RequestCommunityDialog } from "./request-community-dialog";
import type { CommunitySummary } from "./types";
import type { CommunityTopic } from "@/../generated/prisma/enums";

/**
 * The community-browsing surface shared by /communities and /forum's
 * Communities tab (desktop-02.md #28-29: they show the same "Recommended
 * for you" grid + region banner + filters). One implementation so both
 * routes stay pixel-identical rather than drifting.
 */
export function CommunitiesBrowser({
  communities,
  basePath = "/communities",
  search,
  region,
  topic,
  searchParamsForNav = {},
  showRequestButton = false,
}: {
  communities: CommunitySummary[];
  basePath?: string;
  search?: string;
  region?: string;
  topic?: CommunityTopic;
  searchParamsForNav?: Record<string, string | undefined>;
  showRequestButton?: boolean;
}) {
  const regionOptions = Array.from(new Set(communities.map((community) => community.region))).sort();
  const normalizedSearch = search?.toLowerCase();
  const visibleCommunities = communities.filter((community) => {
    if (region && community.region !== region) return false;
    if (topic && community.primaryTopic !== topic) return false;
    if (!normalizedSearch) return true;

    return (
      community.name.toLowerCase().includes(normalizedSearch) ||
      community.region.toLowerCase().includes(normalizedSearch) ||
      community.description.toLowerCase().includes(normalizedSearch)
    );
  });

  return (
    <div className="space-y-6">
      {showRequestButton ? (
        <div className="flex justify-end">
          <RequestCommunityDialog />
        </div>
      ) : null}

      <CommunitiesToolbar
        basePath={basePath}
        search={search}
        region={region}
        topic={topic}
        regionOptions={regionOptions}
        searchParamsForNav={searchParamsForNav}
      />

      <RegionBanner regionOptions={regionOptions} />

      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          ✨ Recommended for you
        </h2>
        <p className="text-sm text-muted-foreground">
          Based on your region and topics you follow.
        </p>
      </div>

      {visibleCommunities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-glass-border p-8 text-center text-sm text-muted-foreground">
          No communities match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      )}
    </div>
  );
}
