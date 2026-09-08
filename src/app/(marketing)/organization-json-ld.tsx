import { siteUrl } from "@/lib/site-origin";

const organizationDescription =
  "Hands-on computer and cellphone hardware servicing training from HardTech IT Corp.";

/** Escape JSON for a script element so content can never terminate the tag. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Use only organisation facts already represented by the public site. Contact
 * details, accreditation, pricing, ratings, and opening hours stay out until
 * HardTech verifies them for public use.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "HardTech IT Corp",
    url: siteUrl("/").toString(),
    logo: siteUrl("/images/brand/hardtech-logo.png").toString(),
    description: organizationDescription,
  };
}

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(organizationJsonLd()) }}
    />
  );
}
