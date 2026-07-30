"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { joinCommunity } from "./mutations/join-community";
import { useGuardedMutation } from "@/features/forum/use-guarded-mutation";

/**
 * "Join" button on a community card (desktop-02.md #29). The one card the
 * current user already belongs to renders no button at all (open question 7
 * in that spec — no explicit "Joined" badge was visible, so this renders a
 * disabled "Joined" state instead of nothing, which is a safer reading than
 * silently hiding membership status).
 *
 * Guards: disabled prop, isPending visual state, early-return inside
 * useGuardedMutation. CommunityMembership's compound unique constraint on
 * [communityId, userId] is what makes a double-fire click safe in wave 3.
 */
export function JoinButton({
  communityId,
  isJoined,
}: {
  communityId: string;
  isJoined: boolean;
}) {
  const { isPending, run } = useGuardedMutation(joinCommunity, "Joining isn't wired up yet.");

  if (isJoined) {
    return (
      <Button type="button" variant="outline" size="sm" disabled>
        <Check className="size-3.5" aria-hidden /> Joined
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending}
      onClick={() => void run({ idempotencyKey: crypto.randomUUID(), communityId })}
    >
      {isPending ? "Joining…" : "Join"}
    </Button>
  );
}
