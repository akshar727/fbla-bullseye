import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { FlickeringGrid } from "./ui/flickering-grid";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6 bg-gray-50">
      <FlickeringGrid
        className="absolute inset-0 z-0 size-full [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#01053d"
        maxOpacity={0.2}
        flickerChance={0.1}
      />
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-navy-950 text-3xl md:text-5xl font-bold font-sans text-balance">
          Ready to find what you lost?
        </h2>
        <p className="text-navy-600 mt-4 text-lg leading-relaxed font-sans max-w-xl mx-auto">
          Join thousands of people already reuniting with their belongings
          through Bullseye.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
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
        </div>
      </div>
    </section>
  );
}
