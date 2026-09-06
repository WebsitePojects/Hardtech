import type { Metadata } from "next";

import { createSiteMetadata } from "@/lib/site-origin";
import { getTrainers } from "@/server/services/marketing.service";
import { AboutHero } from "@/features/about/hero";
import { OurStory } from "@/features/about/our-story";
import { Foundation } from "@/features/about/foundation";
import { Instructors } from "@/features/about/instructors";
import { Advantage } from "@/features/about/advantage";

export const metadata: Metadata = createSiteMetadata({
  title: "About — HardTech IT Corp",
  description:
    "Learn about HardTech IT Corp and the hands-on approach behind our computer and cellphone hardware servicing training.",
  path: "/about",
});

export default async function AboutPage() {
  const trainers = await getTrainers();

  return (
    <>
      <AboutHero />
      <OurStory />
      <Foundation />
      <Instructors trainers={trainers} />
      <Advantage />
    </>
  );
}
