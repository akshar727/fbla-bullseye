"use client";
import { CtaSection } from "@/components/cta-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/features-section";
import Footer from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialSection } from "@/components/testimonial-section";
import { useRouter } from "next/navigation";
import { ScrollProgress } from "@/components/ui/scroll-progress";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <ScrollProgress className="top-16 h-[4px] rounded-full" />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </>
  );
}
