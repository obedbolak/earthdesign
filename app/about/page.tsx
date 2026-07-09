// app/about/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/about/HeroSection";
import StorySection from "@/components/about/StorySection";
import MissionVisionSection from "@/components/about/MissionVisionSection";
import StatsSection from "@/components/about/StatsSection";
import TeamSection from "@/components/about/TeamSection";
import ValuesSection from "@/components/about/ValuesSection";
import MilestonesSection from "@/components/about/MilestonesSection";
import PartnersSection from "@/components/about/PartnersSection";
import CTASection from "@/components/about/CTASection";

export const metadata: Metadata = {
  title: "About Us | Earth Design - Trusted Real Estate in Cameroon",
  description:
    "Learn about Earth Design's mission to transform real estate in Cameroon. Discover our story, values, and the team behind your dream property.",
  keywords: [
    "Earth Design",
    "about us",
    "real estate Cameroon",
    "property development",
    "Douala",
    "Yaoundé",
  ],
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <StorySection />
      <MissionVisionSection />
      <StatsSection />
      <ValuesSection />
      <TeamSection />
      <MilestonesSection />
      <PartnersSection />
      <CTASection />
    </main>
  );
}
