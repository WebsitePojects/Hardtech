import { ExternalLink } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { TrainerWithUser } from "@/server/services/marketing.service";

/**
 * "Meet Your Instructors" section, verbatim copy from
 * docs/screens/desktop-01.md #9 and docs/screens/mobile-01.md #15-20.
 *
 * Each card's "Experience & Credentials" accordion defaults to collapsed —
 * per desktop-01.md #9 ("chevron-down... collapsed in all 4 cards here"),
 * which is the explicit default-state screenshot. mobile-01.md's slice shows
 * all four expanded in sequence but flags its own ambiguity (Open Questions
 * #3: "unclear if cards default to expanded... or the user tapped through
 * all 4"); the desktop shot is unambiguous, so collapsed-by-default wins.
 *
 * Accordion type="single" collapsible per card (not shared across cards) —
 * each instructor's credentials expand independently, matching both slices.
 *
 * The shadcn Facebook brand icon is not in this lucide-react version
 * (checked: `Facebook` export does not exist in lucide-react@1.27). Used
 * ExternalLink instead for the "Facebook Profile" link — flagged, not a
 * silent swap.
 */
function initialsOf(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Instructors({ trainers }: { trainers: TrainerWithUser[] }) {
  if (trainers.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary uppercase">
          EXPERT TRAINERS
        </p>
        <h2 className="text-3xl font-bold sm:text-4xl">
          Meet Your <span className="text-primary">Instructors</span>
        </h2>
        <p className="mt-2 text-muted-foreground">
          The four working professionals leading every HardTech session —
          not just academics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trainers.map((trainer) => (
          <Card key={trainer.id}>
            <CardContent className="flex flex-col gap-4">
              <Avatar size="lg" className="border border-primary/40">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {initialsOf(trainer.user.firstName, trainer.user.lastName)}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold">
                  {trainer.user.firstName} {trainer.user.lastName}
                </p>
                <Badge
                  variant="outline"
                  className="mt-1 border-primary/40 text-primary"
                >
                  {trainer.title}
                </Badge>
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground">{trainer.bio}</p>

              <Separator />

              <Accordion type="single" collapsible>
                <AccordionItem value="credentials" className="border-none">
                  <AccordionTrigger className="text-sm font-semibold">
                    Experience &amp; Credentials
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                      {trainer.credentials.map((credential) => (
                        <li
                          key={credential}
                          className="flex items-start gap-2"
                        >
                          <span
                            className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                            aria-hidden
                          />
                          {credential}
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {trainer.facebookUrl ? (
                <a
                  href={trainer.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-1.5 rounded-full border border-brand-blue/40 px-3 py-1.5 text-xs font-medium text-brand-blue"
                >
                  Facebook Profile
                  <ExternalLink className="size-3.5" />
                </a>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
