import Link from "next/link";
import { Upload, UserCheck, HandCoins, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

const steps = [
  {
    icon: Upload,
    title: "Upload Found Items",
    description:
      "Found something? Snap a photo, add a description and location, and upload it in seconds. Your listing goes live immediately so the owner can find it fast.",
  },
  {
    icon: UserCheck,
    title: "Claim Your Belongings",
    description:
      "Lost something? Browse or search the database, then submit a claim with proof of ownership. We verify and connect you with the finder securely.",
  },
  {
    icon: HandCoins,
    title: "Chat, Confirm & Retrieve",
    description:
      "Have questions before claiming? Use item inquiries to chat back and forth. Once a claim is submitted, the finder reviews and approves it. When both sides are ready, coordinate the return date directly through the platform with administrators.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-6 bg-gray-50">
      <FlickeringGrid
        className="absolute inset-0 z-0 size-full [mask-image:radial-gradient(450px_circle_at_center,white,transparent)]"
        squareSize={4}
        gridGap={6}
        color="#01053d"
        maxOpacity={0.4}
        flickerChance={0.1}
      />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 md:mb-20">
          <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-3 font-sans">
            How it works
          </p>
          <h2 className="text-primary text-3xl md:text-6xl font-bold font-sans text-balance">
            Post. Claim. Retrieve.
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <Card key={step.title} className="shadow-none">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <span className="flex items-center justify-center size-12 rounded-xl bg-primary text-white shrink-0">
                    <step.icon className="size-6" />
                  </span>
                  <span className="text-muted-foreground text-sm font-mono font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans">{step.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <Button size="lg" className="font-semibold" asChild>
            <Link href="/signup">
              Get started now
              <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
