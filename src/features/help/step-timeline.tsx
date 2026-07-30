import { Bilingual } from "@/features/help/bilingual";
import type { HelpStep } from "@/features/help/help-content";

/**
 * The numbered vertical stepper used inside every Help Center section: a
 * green circled number per step connected by a thin vertical rule, with
 * bilingual instruction text beside it. No shadcn primitive covers this, so
 * it is a small dedicated component.
 */
export function StepTimeline({ steps }: { steps: HelpStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, index) => (
        <li key={index} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
              {index + 1}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="my-1 w-px flex-1 bg-primary/25"
              />
            )}
          </div>
          <div className="pb-5">
            <Bilingual text={step} />
          </div>
        </li>
      ))}
    </ol>
  );
}
