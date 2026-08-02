"use client";

import { useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ACCENT_STYLES } from "@/features/help/accent-styles";
import { Bilingual } from "@/features/help/bilingual";
import {
  HELP_ROLES,
  HELP_TIP,
  type HelpRoleId,
} from "@/features/help/help-content";
import { StepTimeline } from "@/features/help/step-timeline";

export function RoleExplorer() {
  const [selectedRoleId, setSelectedRoleId] = useState<HelpRoleId>("trainee");
  const selectedRole =
    HELP_ROLES.find((role) => role.id === selectedRoleId) ?? HELP_ROLES[0];
  const accent = ACCENT_STYLES[selectedRole.accent];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      {/* Role selector — 2-then-1 wrap, not a strict 3-column grid. */}
      <div className="mx-auto flex max-w-md flex-wrap justify-center gap-3">
        {HELP_ROLES.map((role) => {
          const roleAccent = ACCENT_STYLES[role.accent];
          const isSelected = role.id === selectedRoleId;
          const RoleIcon = role.icon;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRoleId(role.id)}
              aria-pressed={isSelected}
              className={cn(
                "flex w-40 flex-col items-center gap-2 rounded-2xl border-2 bg-card px-4 py-4 text-center transition-colors",
                isSelected
                  ? cn(roleAccent.border, "ring-2", roleAccent.ring)
                  : "border-border/60 hover:border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  isSelected ? roleAccent.iconBg : "bg-muted",
                )}
              >
                <RoleIcon
                  className={cn(
                    "size-5",
                    isSelected ? roleAccent.text : "text-muted-foreground",
                  )}
                />
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? roleAccent.text : "text-foreground",
                )}
              >
                {role.label.en}
              </span>
              <span className="text-xs text-muted-foreground">
                {role.label.fil}
              </span>
            </button>
          );
        })}
      </div>

      {/* Role description */}
      <Card className={cn("mt-8 bg-surface-secondary", accent.tintBg, "border", accent.border)}>
        <CardContent className="flex flex-col items-center gap-3 text-center">
          <Bilingual
            text={selectedRole.description}
            enClassName="font-medium text-foreground"
            filClassName="text-sm text-muted-foreground"
          />
          <span className={cn("text-sm font-semibold", accent.text)}>
            {selectedRole.sections.length} sections ·{" "}
            {selectedRole.sections.length} seksyon
          </span>
        </CardContent>
      </Card>

      {/* Tip callout */}
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-blue/30 bg-brand-blue/10 px-4 py-3">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-blue" />
        <Bilingual
          text={HELP_TIP}
          enClassName="text-sm font-medium text-brand-blue"
          filClassName="mt-0.5 text-xs text-muted-foreground"
        />
      </div>

      {/* Section accordion — single-expand, one card per section. */}
      <Accordion
        key={selectedRole.id}
        type="single"
        collapsible
        defaultValue={selectedRole.sections[0]?.id}
        className="mt-6 gap-3"
      >
        {selectedRole.sections.map((section) => {
          const SectionIcon = section.icon;

          return (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="rounded-2xl border-b-0 bg-card px-4 ring-1 ring-glass-border"
            >
              <AccordionTrigger className="items-center py-4 hover:no-underline">
                <span className="flex items-center gap-3 text-left">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      accent.iconBg,
                    )}
                  >
                    <SectionIcon className={cn("size-4.5", accent.text)} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">
                      {section.title.en}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {section.title.fil}
                    </span>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <StepTimeline steps={section.steps} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Still need help? */}
      <Card className="mt-6 bg-surface-secondary">
        <CardContent className="flex flex-col items-center gap-2 text-center">
          <h3 className="font-heading text-lg font-semibold">
            Still need help? · Kailangan pa ng tulong?
          </h3>
          <p className="text-sm text-muted-foreground">
            Visit our{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Contact page
            </Link>{" "}
            or ask your trainer directly.
          </p>
          <p className="text-sm text-muted-foreground">
            Bisitahin ang aming{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              Contact page
            </Link>{" "}
            o direkta na tanungin ang iyong trainer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
