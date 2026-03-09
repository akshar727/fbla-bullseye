"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FlickeringGrid } from "./ui/flickering-grid";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6">
      <FlickeringGrid
        className="absolute inset-0 z-0 size-full [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#01053d"
        maxOpacity={0.2}
        flickerChance={0.1}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-navy-950 text-3xl md:text-5xl font-bold font-sans text-balance"
        >
          Ready to find what you lost?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-navy-600 mt-4 text-lg leading-relaxed font-sans max-w-xl mx-auto"
        >
          Join hundreds of people already reuniting with their belongings
          through Bullseye.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
        >
          <Button
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 font-semibold"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button size="lg" asChild variant="outline" className="font-semibold">
            <Link href="/browse">
              Browse Found Items
              <ArrowRight className="size-5 ml-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
