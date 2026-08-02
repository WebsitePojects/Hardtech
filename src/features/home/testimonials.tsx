import { getPrograms } from "@/server/services/marketing.service";
import { Award, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/../generated/prisma/client";

const BADGE_CLASSES: Record<string, string> = { green: "border-primary/40 text-primary", blue: "border-brand-blue/40 text-brand-blue", purple: "border-brand-purple/40 text-brand-purple", amber: "border-brand-orange/40 text-brand-orange", orange: "border-brand-orange/40 text-brand-orange" };
function resolveBadgeClass(color: string | null): string { return color ? BADGE_CLASSES[color.toLowerCase()] ?? BADGE_CLASSES.green : BADGE_CLASSES.green; }

function TestimonialCard({ testimonial, category, featured = false }: { testimonial: Testimonial; category: string | null; featured?: boolean }) {
  return (
    <Card className={featured ? "min-h-[245px] border-primary/20" : "min-h-[270px]"}>
      <CardContent className="flex h-full flex-col gap-4">
        {featured ? <Quote className="size-12 text-brand-orange/25" fill="currentColor" /> : null}
        <Badge variant="outline" className={`w-fit ${resolveBadgeClass(testimonial.badgeColor)}`}><Award className="size-3" /> Certified</Badge>
        <p className={featured ? "text-lg text-foreground" : "text-sm text-muted-foreground"}>&ldquo;{testimonial.quoteText}&rdquo;</p>
        <div className="mt-auto flex items-center gap-3">
          <Avatar><AvatarFallback className="bg-primary/10 text-primary">{testimonial.avatarInitials}</AvatarFallback></Avatar>
          <div className="min-w-0"><p className="font-semibold">{testimonial.authorName}</p><p className="text-sm text-muted-foreground">{testimonial.authorRole}</p></div>
        </div>
        {category ? <Badge variant="outline" className="w-fit border-primary/30 text-primary">{category}</Badge> : null}
      </CardContent>
    </Card>
  );
}

export async function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const programs = await getPrograms();
  const categoryById = new Map(programs.map((program) => [program.id, program.shortName]));
  const featured = testimonials.find((testimonial) => testimonial.isFeatured) ?? testimonials[0];
  const rest = testimonials.filter((testimonial) => testimonial.id !== featured.id);
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold tracking-widest text-primary uppercase"><span aria-hidden>✦</span> SUCCESS STORIES</p>
        <h2 className="text-3xl font-bold sm:text-4xl">What Our Graduates Say</h2>
        <p className="mt-2 text-muted-foreground">Real reviews from real graduates who transformed their careers</p>
      </div>
      <div className="mb-6"><TestimonialCard testimonial={featured} category={featured.programId ? categoryById.get(featured.programId) ?? null : null} featured /></div>
      {rest.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{rest.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} category={testimonial.programId ? categoryById.get(testimonial.programId) ?? null : null} />)}</div> : null}
    </section>
  );
}
