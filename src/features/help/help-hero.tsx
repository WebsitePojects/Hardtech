import { CircleHelp } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function HelpHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem]" />
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-10 text-center sm:px-6 lg:pt-24">
        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <CircleHelp className="size-3 text-primary" />
          User Guide · Gabay sa Gumagamit
        </Badge>
        <h1 className="mt-4 font-heading text-4xl font-bold text-balance sm:text-5xl">
          How to Use <span className="text-primary">HardTech IT Corp.</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Step-by-step guide for every user role. In English and Filipino so
          everyone can follow along.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Hakbang-hakbang na gabay para sa bawat uri ng gumagamit. Sa Ingles
          at Filipino.
        </p>
        <p className="mt-8 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Select Your Role · Piliin ang Iyong Papel
        </p>
      </div>
    </section>
  );
}
