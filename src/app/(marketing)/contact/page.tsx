import { getFaqs } from "@/server/services/marketing.service";
import { ContactHero } from "@/features/contact/contact-hero";
import { FaqSection } from "@/features/contact/faq-section";
import { OfficesSection } from "@/features/contact/offices-section";

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
