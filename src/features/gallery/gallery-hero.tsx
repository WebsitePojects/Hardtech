import { Award, Camera, Diamond, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const STATS = [
  { icon: Camera, value: "500+", label: "Photos" },
  { icon: Users, value: "10,000+", label: "People Trained" },
  { icon: Award, value: "50+", label: "Ceremonies" },
  { icon: Zap, value: "20+", label: "Years of Training" },
] as const;

export function GalleryHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24">
        <div>
          <Badge variant="outline" className="gap-1.5 text-muted-foreground">
            <Diamond className="size-3 text-primary" />
            GALLERY
          </Badge>
          <h1 className="mt-4 font-heading text-4xl font-bold text-balance sm:text-5xl">
            Training in
            <span className="block text-primary">Action</span>
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Real moments from our training sessions, workshops, and graduation
            ceremonies. Every photo tells the story of someone building their
            future.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <Card key={label} className="bg-surface-secondary ring-glass-border">
              <CardContent className="flex flex-col gap-2">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </span>
                <span className="font-heading text-2xl font-bold text-primary">
                  {value}
                </span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
