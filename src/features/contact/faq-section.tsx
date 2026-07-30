import { Diamond } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { Faq } from "@/../generated/prisma/client";

export function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Badge variant="outline" className="gap-1.5 text-muted-foreground">
        <Diamond className="size-3 text-primary" />
        FAQ
      </Badge>
      <h2 className="mt-4 font-heading text-3xl font-bold text-balance sm:text-4xl">
        Frequently Asked <span className="text-primary">Questions</span>
      </h2>

      <Accordion type="single" collapsible className="mt-8 gap-3">
        {faqs.map((faq) => (
          <AccordionItem
            key={faq.id}
            value={faq.id}
            className="rounded-2xl border-b-0 bg-card px-4 ring-1 ring-glass-border"
          >
            <AccordionTrigger className="py-4 text-base hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
