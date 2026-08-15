import { Building2, Diamond, Mail, Phone, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { OFFICES } from "@/features/contact/offices";

const CONTACT_CARDS = [
  {
    icon: Phone,
    label: "Call Us",
    value: "(123) 456-7890",
    caption: "Mon–Fri 9AM–5PM",
  },
  {
    icon: Mail,
    label: "Email Us",
    value: "hardtechitcorp@gmail.com",
    caption: "Reply within 24hrs",
  },
  {
    icon: Building2,
    label: "Main Office",
    value: OFFICES[0].addressShort,
    caption: "Novaliches, Quezon City",
  },
  {
    icon: MapPin,
    label: "Branch Office",
    value: OFFICES[1].addressShort,
    caption: "Quezon City, Metro Manila",
  },
] as const;

export function ContactHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[26rem]" />
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Badge variant="outline" className="gap-1.5 text-muted-foreground">
          <Diamond className="size-3 text-primary" />
          CONTACT &amp; LOCATION
        </Badge>
          <h1 className="mt-5 max-w-2xl font-heading text-4xl font-bold leading-[1.08] text-balance sm:text-5xl lg:text-6xl">
          Get in Touch &amp; <span className="text-primary">Find Us</span>
        </h1>
        <p className="mt-5 max-w-2xl text-muted-foreground">
          Have questions about our programs? Visit us at either of our two
          locations or reach out through any of our contact channels.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {CONTACT_CARDS.map(({ icon: Icon, label, value, caption }, index) => (
            <Card key={label} className={cn("bg-surface-secondary transition-[border-color,box-shadow,transform] motion-reduce:transition-none lg:hover:-translate-y-1 lg:hover:border-primary/40 lg:hover:shadow-glow-sm", index === 0 ? "lg:col-span-5" : index === 1 ? "lg:col-span-7" : "lg:col-span-6")}>
              <CardContent className="flex flex-col gap-2 py-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </span>
                <span className="font-medium">{label}</span>
                <span className="font-heading text-primary">{value}</span>
                <span className="text-xs text-muted-foreground">
                  {caption}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
