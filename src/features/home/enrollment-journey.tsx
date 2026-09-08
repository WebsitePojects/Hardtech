import { BadgeCheck, ClipboardCheck, MousePointerClick } from "lucide-react";

const STEPS = [
  {
    icon: MousePointerClick,
    title: "Choose a program",
    description: "Compare the training options and select the program you want to take.",
  },
  {
    icon: ClipboardCheck,
    title: "Submit enrollment and payment proof",
    description: "Complete the online enrollment form, choose a payment method, and upload your proof of payment.",
  },
  {
    icon: BadgeCheck,
    title: "Receive verification and dashboard access",
    description: "An administrator verifies your submission. Once approved, you can sign in to your trainee dashboard.",
  },
] as const;

export function EnrollmentJourney() {
  return (
    <section className="border-y border-glass-border bg-surface-secondary/55" aria-labelledby="enrollment-journey-heading">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Your enrollment path</p>
            <h2 id="enrollment-journey-heading" className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Know what happens next.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              A clear path from choosing your course to getting access to the tools you will use during training.
            </p>
          </div>

          <ol className="grid gap-0 border-t border-glass-border sm:grid-cols-3 sm:border-t-0 sm:divide-x sm:divide-glass-border">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="border-b border-glass-border py-5 last:border-b-0 sm:border-b-0 sm:px-5 sm:py-0 first:sm:pl-0 last:sm:pr-0">
                  <div className="flex items-start gap-4 sm:block">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-sm font-semibold text-primary">0{index + 1}</span>
                    <div className="sm:mt-6">
                      <Icon className="mb-3 hidden size-5 text-primary sm:block" aria-hidden />
                      <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}