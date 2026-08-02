import { getSession } from "@/server/auth/session";
import { listPendingForumPosts } from "@/server/services/forum-write.service";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header";
import { DataNotConnectedNote } from "../components/data-not-connected-note";
import { ForumModerationCard, type ForumModerationItem } from "../components/forum-moderation-card";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export async function ForumModerationSection() {
  const session = await getSession();
  const posts = session?.role === "ADMIN" ? await listPendingForumPosts(session.userId, session.role) : [];
  const items: ForumModerationItem[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    authorName: `${post.author.firstName} ${post.author.lastName}`,
    category: post.category ?? "Uncategorized",
    createdDateLabel: formatDate(post.createdAt),
  }));

  return (
    <section className="space-y-4" aria-labelledby="forum-moderation-heading">
      <DashboardPageHeader
        title="Forum Moderation"
        description="Review trainee posts before they become visible to the community."
      />
      <div id="forum-moderation-heading" className="sr-only">Forum Moderation</div>
      {items.length === 0 ? (
        <DataNotConnectedNote detail="No trainee posts are waiting for approval." />
      ) : (
        <div className="space-y-3">{items.map((item) => <ForumModerationCard key={item.id} item={item} />)}</div>
      )}
    </section>
  );
}
