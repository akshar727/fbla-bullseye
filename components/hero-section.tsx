"use client";

import { motion } from "motion/react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { Marquee } from "@/components/ui/marquee";
import { MarqueeCard } from "@/components/marquee-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { useUser } from "@/hooks/use-user";

const marqueeCards = Array.from({ length: 6 }, (_, i) => i);

export function HeroSection() {
  const { user } = useUser();
  return (
    <section aria-label="Hero" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background marquee - absolutely positioned behind everything */}
      <div aria-hidden="true" className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
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
            className="hidden sm:flex h-full [--duration:30s] [--gap:1rem]"
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
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold font-sans leading-tight text-balance flex items-center justify-center gap-2 md:gap-4"
        >
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
          <Search aria-hidden="true" className="w-[1em] h-[1em] hidden sm:block" />
        </motion.h1>
        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-muted-foreground text-xs md:text-xl font-mono tracking-wide uppercase"
        >
          Pinpoint your lost items within seconds
        </motion.p>
        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-4"
        >
          <Button size="lg" asChild>
            <a href={user ? "/dashboard" : "/signup"}>
              {user ? "Open Dashboard" : "Sign Up"}
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/browse">
              Browse Found Items
              <ArrowRight aria-hidden="true" className="size-5 ml-1" />
            </a>
          </Button>
        </motion.div>

        {/* Trust signal */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-muted-foreground text-sm mt-4 font-sans"
        >
          Trusted by hundreds of students
        </motion.p>
      </div>
    </section>
  );
}
