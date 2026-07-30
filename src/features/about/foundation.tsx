import { Eye, Heart, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * "Our Foundation" — Mission, Vision & Philosophy, verbatim from
 * docs/screens/desktop-01.md #8 and docs/screens/mobile-01.md #14-15.
 * Static copy, not backed by a service function.
 */
const PILLARS: Array<{ icon: LucideIcon; label: string; description: string }> = [
  {
    icon: Target,
    label: "OUR MISSION",
    description:
      "To empower individuals and businesses through innovative electronic devices servicing and software development.",
  },
  {
    icon: Eye,
    label: "OUR VISION",
    description:
      "A future where people have knowledge on hardware servicing and I.T. software development.",
  },
  {
    icon: Heart,
    label: "OUR PHILOSOPHY",
    description:
      "Learning happens through doing — every lesson is grounded in real-world practice and industry tools.",
  },
];

export function Foundation() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
          OUR FOUNDATION
        </p>
        <h2 className="text-3xl font-bold sm:text-4xl">
          Mission, Vision &amp; <span className="text-primary">Philosophy</span>
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {PILLARS.map((pillar) => (
          <Card key={pillar.label}>
            <CardContent className="flex flex-col gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <pillar.icon className="size-5" />
              </span>
              <p className="text-xs font-semibold tracking-wide text-primary uppercase">
                {pillar.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {pillar.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
