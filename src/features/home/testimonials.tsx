import { Award } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Testimonial } from "@/../generated/prisma/client";

/**
 * "What Our Graduates Say" section, verbatim copy from
 * docs/screens/desktop-01.md #4-5 and docs/screens/mobile-01.md #5-7.
 *
 * The design shows a category chip on each card ("Computer Hardware",
 * "Cellphone Repair", "Software Dev") sourced from the testimonial's linked
 * program. getTestimonials() returns bare Testimonial rows with no program
 * join (see marketing.service contract), so that chip cannot be rendered
 * here without importing the repository directly, which the contract
 * forbids — omitted and flagged in the return report.
 */
const BADGE_CLASSES: Record<string, string> = {
  green: "border-primary/40 text-primary",
  blue: "border-brand-blue/40 text-brand-blue",
  purple: "border-brand-purple/40 text-brand-purple",
  amber: "border-brand-orange/40 text-brand-orange",
  orange: "border-brand-orange/40 text-brand-orange",
};

function resolveBadgeClass(badgeColor: string | null): string {
  if (!badgeColor) return BADGE_CLASSES.green;
  return BADGE_CLASSES[badgeColor.toLowerCase()] ?? BADGE_CLASSES.green;
}

function TestimonialCard({
  testimonial,
  featured = false,
}: {
  testimonial: Testimonial;
  featured?: boolean;
}) {
  return (
    <Card className={featured ? "border-primary/20" : undefined}>
      <CardContent className="flex flex-col gap-4">
        <Badge
          variant="outline"
          className={`w-fit ${resolveBadgeClass(testimonial.badgeColor)}`}
        >
          <Award className="size-3" />
          Certified
        </Badge>

        <p
          className={
            featured
              ? "text-lg text-foreground"
              : "text-sm text-muted-foreground"
          }
        >
          &ldquo;{testimonial.quoteText}&rdquo;
        </p>

        <div className="mt-auto flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {testimonial.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{testimonial.authorName}</p>
            <p className="text-sm text-muted-foreground">
              {testimonial.authorRole}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  if (testimonials.length === 0) return null;

  const featured = testimonials.find((t) => t.isFeatured) ?? testimonials[0];
  const rest = testimonials.filter((t) => t.id !== featured.id);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
          SUCCESS STORIES
        </p>
        <h2 className="text-3xl font-bold sm:text-4xl">
          What Our Graduates Say
        </h2>
        <p className="mt-2 text-muted-foreground">
          Real reviews from real graduates who transformed their careers
        </p>
      </div>

      <div className="mb-6">
        <TestimonialCard testimonial={featured} featured />
      </div>

      {rest.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
