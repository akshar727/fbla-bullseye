"use client";

import { Testimonial } from "@/components/testimonial";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";
import { FlickeringGrid } from "@/components/ui/flickering-grid";
import { Highlighter } from "@/components/ui/highlighter";
import { AuroraText } from "@/components/ui/aurora-text";

const ROW_ONE = [
  {
    name: "Marcus T.",
    rating: 5,
    quote: (
      <>
        Left my graphing calculator in the library and found it posted here{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          within the hour
        </Highlighter>
        . Claimed it the same day — super smooth process.
      </>
    ),
  },
  {
    name: "Priya S.",
    rating: 5,
    quote: (
      <>
        I used the{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          inquiry feature
        </Highlighter>{" "}
        to ask about my jacket before even submitting a claim. The finder was
        really responsive. Got it back next morning.
      </>
    ),
  },
  {
    name: "Jordan K.",
    rating: 4,
    quote: (
      <>
        Really impressed by how organized everything is.{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          Category filters
        </Highlighter>{" "}
        made it easy to narrow down what I was looking for in seconds.
      </>
    ),
  },
  {
    name: "Aaliyah M.",
    rating: 5,
    quote: (
      <>
        Posted a found wallet during lunch and the owner claimed it{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          by the end of the day
        </Highlighter>
        . The email notification told me exactly when the claim was approved.
      </>
    ),
  },
];

const ROW_TWO = [
  {
    name: "Sofia L.",
    rating: 5,
    quote: (
      <>
        The{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          photo gallery
        </Highlighter>{" "}
        on each listing is so helpful. I could tell right away from the
        thumbnail that it was my water bottle.
      </>
    ),
  },
  {
    name: "Devon W.",
    rating: 4,
    quote: (
      <>
        Submitted a claim with my justification and the finder{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          approved it within a few hours
        </Highlighter>
        . The whole thing felt really secure and legit.
      </>
    ),
  },
  {
    name: "Camille B.",
    rating: 5,
    quote: (
      <>
        I love that I could{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          ask questions before claiming
        </Highlighter>
        . Saved me from submitting a claim on the wrong item.
      </>
    ),
  },
  {
    name: "Nolan H.",
    rating: 5,
    quote: (
      <>
        Our school desperately needed something like this. Posted a found pair
        of AirPods and they were{" "}
        <Highlighter color="#87CEFA" isView iterations={1}>
          reunited with their owner the next day
        </Highlighter>
        .
      </>
    ),
  },
];

export function TestimonialSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-muted/30">
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 mb-16 md:mb-20 text-center">
          <p className="text-primary font-mono font-semibold text-sm uppercase tracking-widest mb-3">
            Testimonials
          </p>
          <h2 className="text-primary text-3xl md:text-6xl font-bold text-balance">
            Student <AuroraText>Tested.</AuroraText> Staff{" "}
            <AuroraText>Approved.</AuroraText>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg leading-relaxed">
            Real stories from people who&apos;ve used Bullseye to reunite lost
            items with their owners.
          </p>
        </div>

        <ScrollVelocityContainer className="flex flex-col gap-6 py-4">
          <ScrollVelocityRow baseVelocity={5} direction={1}>
            {ROW_ONE.map((t) => (
              <div
                key={t.name}
                className="w-80 shrink-0 mx-4 whitespace-normal"
              >
                <Testimonial name={t.name} rating={t.rating} quote={t.quote} />
              </div>
            ))}
          </ScrollVelocityRow>

          <ScrollVelocityRow baseVelocity={5} direction={-1}>
            {ROW_TWO.map((t) => (
              <div
                key={t.name}
                className="w-80 shrink-0 mx-4 whitespace-normal"
              >
                <Testimonial name={t.name} rating={t.rating} quote={t.quote} />
              </div>
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </div>
      <FlickeringGrid
        className="absolute inset-0 z-0 size-full [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#6B7280"
        maxOpacity={0.5}
        flickerChance={0.1}
      />
    </section>
  );
}
