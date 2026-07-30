import { Award, Users, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProgramCard } from "@/features/programs/program-card";
import { getPrograms, getTrainers } from "@/server/services/marketing.service";

export const metadata = {
  title: "Our Core Programs | HardTech IT Corp",
};

const TRUST_ROW = [
  { icon: Award, label: "Skills-First Training" },
  { icon: Users, label: "50+ Expert Trainers" },
  { icon: Zap, label: "Hands-On Labs" },
];

export default async function ProgramsPage() {
  const [programs, trainers] = await Promise.all([getPrograms(), getTrainers()]);

  return (
    <main>
      <section className="hero-glow px-4 pt-24 pb-12 sm:pt-28">
        <div className="mx-auto max-w-3xl space-y-5 text-center">
          <Badge variant="outline" className="border-primary/40 text-primary">
            &#9670; Training Programs
          </Badge>
          <h1 className="font-heading text-4xl font-bold text-foreground sm:text-5xl">
            Our Core <span className="text-primary">Programs</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Practical, industry-aligned training programs designed to build real skills and
            launch your technology career — no prior credentials required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-muted-foreground">
            {TRUST_ROW.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <Icon className="size-4 text-primary" aria-hidden />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-4 pb-24">
        {programs.map((program, index) => {
          const trainer = trainers.find((candidate) => candidate.userId === program.primaryTrainerId);
          const trainerName = trainer ? `${trainer.user.firstName} ${trainer.user.lastName}` : null;

          return (
            <ProgramCard
              key={program.id}
              program={program}
              trainerName={trainerName}
              imageSide={index % 2 === 0 ? "left" : "right"}
            />
          );
        })}
      </section>
    </main>
  );
}
