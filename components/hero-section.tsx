"use client";

import { TypingAnimation } from "@/components/ui/typing-animation";
import { Marquee } from "@/components/ui/marquee";
import { MarqueeCard } from "@/components/marquee-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";

const marqueeCards = Array.from({ length: 6 }, (_, i) => i);

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background marquee - absolutely positioned behind everything */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
        {/* Left fade */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10" />
        {/* Right fade */}
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex gap-4 h-full opacity-15">
          <Marquee vertical className="h-full [--duration:25s] [--gap:1rem]">
            {marqueeCards.map((i) => (
              <MarqueeCard key={`a-${i}`} />
            ))}
          </Marquee>
          <Marquee
            vertical
            reverse
            className="hidden md:flex h-full [--duration:30s] [--gap:1rem]"
          >
            {marqueeCards.map((i) => (
              <MarqueeCard key={`b-${i}`} />
            ))}
          </Marquee>
          <Marquee
            vertical
            className="h-full [--duration:28s] [--gap:1rem] hidden md:flex lg:flex"
          >
            {marqueeCards.map((i) => (
              <MarqueeCard key={`c-${i}`} />
            ))}
          </Marquee>
          <Marquee
            vertical
            reverse
            className="hidden lg:flex h-full [--duration:32s] [--gap:1rem]"
          >
            {marqueeCards.map((i) => (
              <MarqueeCard key={`d-${i}`} />
            ))}
          </Marquee>
        </div>
      </div>

      {/* Centered hero content - on top of marquee */}
      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-full mx-auto px-6">
        {/* Typing animation headline */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-sans leading-tight text-balance flex items-center justify-center gap-4">
          {"Find your "}
          <span className="inline-block min-w-[3ch]">
            <TypingAnimation
              words={[
                "Purse.",
                "Keys.",
                "Thermos.",
                "Lunchbox.",
                "Wallet.",
                "Jacket.",
                "Laptop.",
              ]}
              loop
              typeSpeed={80}
              deleteSpeed={50}
              pauseDelay={2000}
              cursorStyle="line"
              startOnView={false}
            />
          </span>
          <Search className="w-[1em] h-[1em] hidden md:block" />
        </h1>
        {/* Tagline */}
        <p className="text-muted-foreground text-lg md:text-xl font-sans tracking-wide uppercase">
          Pinpoint your lost items within seconds.
        </p>
        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Button size="lg" asChild>
            <a href="/signup">Sign Up</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/browse">
              Browse Found Items
              <ArrowRight className="size-5 ml-1" />
            </a>
          </Button>
        </div>

        {/* Trust signal */}
        <p className="text-muted-foreground text-sm mt-4 font-sans">
          Trusted by hundreds of students
        </p>
      </div>
    </section>
  );
}
