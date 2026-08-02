import { ArrowUpRight, Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Office } from "@/features/contact/offices";

export function OfficeMapCard({ office }: { office: Office }) {
  const mapsSearchUrl = `https://maps.google.com/?q=${encodeURIComponent(office.addressFull)}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(office.addressFull)}&output=embed`;

  return (
    <Card className="overflow-hidden bg-surface-secondary p-0">
      <div className="relative aspect-video w-full">
        <iframe
          src={mapsEmbedUrl}
          title={`Map — ${office.badgeLabel}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full grayscale invert-[92%] hue-rotate-180 contrast-125"
        />

        <a
          href={mapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="glass absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
        >
          Open in Maps
          <ArrowUpRight className="size-3.5" />
        </a>

        <Badge
          variant="outline"
          className="absolute bottom-3 left-3 border-primary bg-background/80 text-primary"
        >
          {office.badgeLabel}
        </Badge>
      </div>

      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{office.addressFull}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Phone className="size-4 shrink-0 text-primary" />
          <span>{office.phone}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <Mail className="size-4 shrink-0 text-primary" />
          <span>{office.email}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0 text-primary" />
          <span>{office.hours}</span>
        </div>

        <Button asChild className="mt-2 w-full">
          <a href={mapsSearchUrl} target="_blank" rel="noopener noreferrer">
            <Navigation className="size-4" />
            Get Directions
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
