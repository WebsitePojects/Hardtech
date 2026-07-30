import type { Metadata } from "next";

import { getTrainers } from "@/server/services/marketing.service";
import { AboutHero } from "@/features/about/hero";
import { OurStory } from "@/features/about/our-story";
import { Foundation } from "@/features/about/foundation";
import { Instructors } from "@/features/about/instructors";
import { Advantage } from "@/features/about/advantage";

export const metadata: Metadata = {
  title: "About — HardTech IT Corp",
};

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
