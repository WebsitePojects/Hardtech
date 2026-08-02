"use client";

import { useState } from "react";
import { MapPin, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Verbatim from desktop-02.md #28 — this is the only detected region ever
 * shown in the corpus, so it is the seeded default rather than an invented
 * placeholder. Changing it is local UI state only: no geolocation API call
 * and no "save my region" service exist in this wave's contract, so this
 * never claims to persist the choice server-side. */
const DEFAULT_REGION = "NCR / Metro Manila";

export function RegionBanner({ regionOptions }: { regionOptions: string[] }) {
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [editing, setEditing] = useState(false);
  const options = regionOptions.includes(DEFAULT_REGION)
    ? regionOptions
    : [DEFAULT_REGION, ...regionOptions];

  return (
    <Card className="border border-glass-border bg-surface-card ring-0">
      <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
              Detected Region
            </p>
            {editing ? (
              <Select
                value={region}
                onValueChange={(value) => {
                  setRegion(value);
                  setEditing(false);
                }}
              >
                <SelectTrigger className="mt-1 w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <>
                <p className="font-heading text-lg font-semibold text-foreground">{region}</p>
                <p className="text-sm text-muted-foreground">
                  Based on the communities you joined.
                </p>
              </>
            )}
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
          <Pencil className="size-3.5" aria-hidden /> Change region
        </Button>
      </CardContent>
    </Card>
  );
}
