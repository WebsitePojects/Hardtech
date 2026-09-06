import { createSiteMetadata } from "@/lib/site-origin";
import { getFaqs } from "@/server/services/marketing.service";
import { ContactHero } from "@/features/contact/contact-hero";
import { FaqSection } from "@/features/contact/faq-section";
import { OfficesSection } from "@/features/contact/offices-section";

export const metadata = createSiteMetadata({
  title: "Contact HardTech IT Corp",
  description:
    "Find HardTech IT Corp in Quezon City and get answers about our training programs and enrollment.",
  path: "/contact",
});

export default async function ContactPage() {
  const faqs = await getFaqs();

  return (
    <>
      <ContactHero />
      <OfficesSection />
      <FaqSection faqs={faqs} />
    </>
  );
}
