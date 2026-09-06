import { EnrollWizard } from "@/features/enroll/enroll-wizard";
import { createSiteMetadata } from "@/lib/site-origin";
import type { EnrollPaymentMethod, EnrollProgram } from "@/features/enroll/types";
import { decimalToCentavos } from "@/features/programs/format-currency";
import { getPaymentMethods, getPrograms } from "@/server/services/marketing.service";

export const metadata = createSiteMetadata({
  title: "Online Enrollment | HardTech IT Corp",
  description:
    "Review HardTech IT Corp training programs and submit an online enrollment application.",
  path: "/enroll",
});

export default async function EnrollPage() {
  const [programs, paymentMethods] = await Promise.all([getPrograms(), getPaymentMethods()]);

  // Program.priceAmount is a Prisma Decimal class instance and does not
  // survive the server -> client boundary — convert to integer centavos
  // here so the wizard only ever receives plain, serializable data.
  const enrollPrograms: EnrollProgram[] = programs.map((program) => ({
    id: program.id,
    name: program.name,
    durationLabel: program.durationLabel,
    scheduleLabel: program.scheduleLabel,
    priceCentavos: decimalToCentavos(program.priceAmount),
    iconName: program.iconName,
    accentColor: program.accentColor,
    curriculumTopics: program.curriculumTopics.map((topic) => topic.title),
  }));

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
      <EnrollWizard programs={enrollPrograms} paymentMethods={enrollPaymentMethods} />
    </main>
  );
}
