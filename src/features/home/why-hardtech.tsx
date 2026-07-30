import Link from "next/link";
import {
  ChevronRight,
  Diamond,
  GraduationCap,
  Shield,
  Trophy,
  Users,
  Wifi,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * "Built for Success" / Why HardTech section, verbatim from
 * docs/screens/desktop-01.md #3 and docs/screens/mobile-01.md #3-4. Static
 * marketing copy — none of it maps to a Program/Trainer/Testimonial/
 * Gallery/Faq/PaymentMethod row, so it is hardcoded rather than fetched.
 */
const FEATURES: Array<{
  icon: LucideIcon;
  accentClass: string;
  title: string;
  description: string;
}> = [
  {
    icon: Trophy,
    accentClass: "bg-brand-orange/10 text-brand-orange",
    title: "Completion Certificate",
    description:
      "Receive a HardTech e-certificate with QR verification once you finish your program.",
  },
  {
    icon: Users,
    accentClass: "bg-brand-blue/10 text-brand-blue",
    title: "Expert Trainers",
    description:
      "Learn from working professionals with years of real-world industry experience.",
  },
  {
    icon: GraduationCap,
    accentClass: "bg-brand-purple/10 text-brand-purple",
    title: "Flexible Schedules",
    description:
      "Choose from multiple batch schedules — morning, afternoon, or weekend classes.",
  },
  {
    icon: Shield,
    accentClass: "bg-primary/10 text-primary",
    title: "Lifetime Support",
    description:
      "Access resources, alumni network, and community support even after graduation.",
  },
  {
    icon: Zap,
    accentClass: "bg-brand-blue/10 text-brand-blue",
    title: "Hands-On Labs",
    description:
      "Practice on real hardware and equipment in our fully equipped training facility.",
  },
  {
    icon: Wifi,
    accentClass: "bg-brand-purple/10 text-brand-purple",
    title: "Online Portal",
    description:
      "Track progress, download materials, and connect with trainers through our digital platform.",
  },
];

export function WhyHardTech() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center">
        <div>
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest text-primary uppercase">
            <Diamond className="size-3" />
            WHY HARDTECH
          </p>
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built for <span className="text-primary">Success</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            We don&apos;t just teach — we transform. Our training methodology
            is built around industry standards, real equipment, and expert
            mentorship.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/about">
              Our Story
              <ChevronRight />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="flex flex-col gap-3">
                <span
                  className={`inline-flex size-10 items-center justify-center rounded-lg ${feature.accentClass}`}
                >
                  <feature.icon className="size-5" />
                </span>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
