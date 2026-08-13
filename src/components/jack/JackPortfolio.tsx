import { MarqueeSection } from "./MarqueeSection";
import { UseCasesSection } from "./UseCasesSection";
import { AboutSection } from "./AboutSection";
import { ServicesSection } from "./ServicesSection";
import { ProjectsSection } from "./ProjectsSection";
import { CoursesSection } from "./CoursesSection";
import { ReviewsSection } from "./ReviewsSection";
import { FooterSection } from "./FooterSection";

export function JackPortfolio() {
  return (
    <div id="portfolio" style={{ background: "#070B26", fontFamily: "'Kanit', sans-serif", overflowX: "clip" }}>
      <MarqueeSection />
      <UseCasesSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
      <CoursesSection />
      <ReviewsSection />
      <FooterSection />
    </div>
  );
}
