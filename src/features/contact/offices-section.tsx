import { Diamond } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { OfficeMapCard } from "@/features/contact/office-map-card";
import { OFFICES } from "@/features/contact/offices";

export function OfficesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Diamond className="size-3 text-primary" />
        OUR OFFICES
      </Badge>
      <h2 className="mt-4 font-heading text-3xl font-bold text-balance sm:text-4xl">
        Visit Us <span className="text-primary">In Person</span>
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {OFFICES.map((office, index) => (
          <div key={office.id} className={index === 0 ? "lg:col-span-7" : "lg:col-span-5"}>
            <OfficeMapCard office={office} />
          </div>
        ))}
      </div>
    </section>
  );
}
