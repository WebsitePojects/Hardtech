import { CheckCircle2, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type CredentialCardProps = {
  icon: LucideIcon;
  earned: boolean;
  tone: "green" | "blue";
  heading: string;
  name: string;
  subtext: string;
  helperText?: string;
};

const EARNED_BORDER: Record<"green" | "blue", string> = {
  green: "border-primary/40 bg-primary/5 shadow-glow-md",
  blue: "border-brand-blue/40 bg-brand-blue/5 shadow-[0_0_24px_var(--accent-blue-glow)]",
};

const EARNED_ICON_WRAP: Record<"green" | "blue", string> = {
  green: "bg-primary/15 text-primary",
  blue: "bg-brand-blue/15 text-brand-blue",
};

const EARNED_TEXT: Record<"green" | "blue", string> = {
  green: "text-primary",
  blue: "text-brand-blue",
};

/**
 * desktop-02.md #27, mobile-06.md 14:32:50/14:33:14: the two credential
 * badge cards — a genuine earned/locked visual split, not two static
 * images. Earned = tone-coloured glow border, filled icon circle with a
 * checkmark overlay, coloured text. Locked = neutral border, muted icon,
 * muted text, no checkmark overlay.
 */
export function CredentialCard({ icon: Icon, earned, tone, heading, name, subtext, helperText }: CredentialCardProps) {
  return (
    <Card className={cn("border", earned ? EARNED_BORDER[tone] : "border-border")}>
      <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
        <span
          className={cn(
            "relative flex size-12 items-center justify-center rounded-full",
            earned ? EARNED_ICON_WRAP[tone] : "bg-muted text-muted-foreground"
          )}
          aria-hidden
        >
          <Icon className="size-6" />
          {earned ? (
            <CheckCircle2
              className={cn(
                "absolute -right-1 -bottom-1 size-4 rounded-full bg-background",
                EARNED_TEXT[tone]
              )}
            />
          ) : null}
        </span>
        <p
          className={cn(
            "text-xs font-semibold tracking-widest uppercase",
            earned ? EARNED_TEXT[tone] : "text-muted-foreground"
          )}
        >
          HardTech IT Corp
        </p>
        <p className="font-heading text-base font-bold text-foreground">{heading}</p>
        <p className={cn("text-sm font-medium", earned ? EARNED_TEXT[tone] : "text-muted-foreground")}>{name}</p>
        <p className="text-xs text-muted-foreground">{subtext}</p>
        {helperText ? <p className="text-xs text-muted-foreground italic">{helperText}</p> : null}
      </CardContent>
    </Card>
  );
}
