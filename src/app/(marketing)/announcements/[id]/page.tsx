import Link from "next/link";
import { ArrowLeft, CalendarDays, Pin } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicAnnouncement } from "@/server/services/marketing.service";

export default async function AnnouncementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const announcement = await getPublicAnnouncement(id);
  if (!announcement) notFound();

  return (
    <article className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6 lg:py-32">
      <Button asChild variant="ghost" className="mb-8 -ml-2"><Link href="/"><ArrowLeft aria-hidden /> Back to home</Link></Button>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-primary">{announcement.type}</Badge>
        {announcement.isPinned ? <span className="inline-flex items-center gap-1 text-primary"><Pin className="size-3" /> Featured</span> : null}
        <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" /> {announcement.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <h1 className="mt-5 text-balance text-4xl font-bold leading-tight sm:text-5xl">{announcement.title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Posted by {announcement.postedByName}</p>
      {announcement.mediaUrl ? <img src={announcement.mediaUrl} alt="" className="mt-10 max-h-[30rem] w-full rounded-2xl border border-glass-border object-cover" /> : null}
      <div className="mt-10 whitespace-pre-line text-base leading-8 text-foreground/85">{announcement.body}</div>
    </article>
  );
}
