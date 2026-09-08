import { EnrollWizard } from "@/features/enroll/enroll-wizard";
import { enrollProgramQuerySchema } from "@/features/enroll/enroll.schema";
import { createSiteMetadata } from "@/lib/site-origin";
import type { EnrollPaymentMethod, EnrollProgram } from "@/features/enroll/types";
import { decimalToCentavos } from "@/features/programs/format-currency";
import {
  getPaymentMethods,
  getPrograms,
  getPublishedProgramBySlug,
} from "@/server/services/marketing.service";

export const metadata = createSiteMetadata({
  title: "Online Enrollment | HardTech IT Corp",
  description:
    "Review HardTech IT Corp training programs and submit an online enrollment application.",
  path: "/enroll",
});

type EnrollPageProps = {
  searchParams: Promise<{ program?: string | string[] | undefined }>;
};

export default async function EnrollPage({ searchParams }: EnrollPageProps) {
  const rawSearchParams = await searchParams;
  const rawProgram = rawSearchParams.program;
  const parsedQuery = enrollProgramQuerySchema.safeParse({ program: rawProgram });
  const hasProgramLink = rawProgram !== undefined;

  // Resolve the public slug through the service boundary before the client
  // receives an id. A database id in the URL must never preselect checkout.
  const requestedProgram = parsedQuery.success && parsedQuery.data.program
    ? await getPublishedProgramBySlug(parsedQuery.data.program)
    : null;

  const [programs, paymentMethods] = await Promise.all([getPrograms(), getPaymentMethods()]);

  // Program.priceAmount is a Prisma Decimal class instance and does not
  // survive the server -> client boundary — convert to integer centavos
  // here so the wizard only ever receives plain, serializable data.
  const enrollPrograms: EnrollProgram[] = programs
    .filter((program) => program.enrollmentOpen)
    .map((program) => ({
    id: program.id,
    slug: program.slug,
    name: program.name,
    durationLabel: program.durationLabel,
    scheduleLabel: program.scheduleLabel,
    priceCentavos: decimalToCentavos(program.priceAmount),
    iconName: program.iconName,
    accentColor: program.accentColor,
    curriculumTopics: program.curriculumTopics.map((topic) => topic.title),
    }));

  const initialProgramId = requestedProgram?.enrollmentOpen
    && enrollPrograms.some((program) => program.id === requestedProgram.id)
    ? requestedProgram.id
    : null;

  const programNotice = hasProgramLink && !initialProgramId
    ? "That program link is unavailable or is not accepting enrollment. Please choose from the current open programs."
    : null;

  const enrollPaymentMethods: EnrollPaymentMethod[] = paymentMethods
    .filter((method) => method.isEnabled)
    .map((method) => ({
      method: method.method,
      displayName: method.displayName,
      note: method.note,
      accountNumber: method.accountNumber,
      accountName: method.accountName,
      bankName: method.bankName,
    }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
      {programNotice ? (
        <p
          className="mb-5 rounded-xl border border-brand-orange/40 bg-brand-orange/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {programNotice}
        </p>
      ) : null}
      <EnrollWizard
        programs={enrollPrograms}
        paymentMethods={enrollPaymentMethods}
        initialProgramId={initialProgramId}
      />
    </main>
  );
}
