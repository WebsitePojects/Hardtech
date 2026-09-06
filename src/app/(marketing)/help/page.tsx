import { createSiteMetadata } from "@/lib/site-origin";
import { HelpHero } from "@/features/help/help-hero";
import { RoleExplorer } from "@/features/help/role-explorer";

export const metadata = createSiteMetadata({
  title: "Help Centre | HardTech IT Corp",
  description:
    "Find answers and guidance for enrolling, learning, and using the HardTech IT Corp platform.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <>
      <HelpHero />
      <RoleExplorer />
    </>
  );
}
