"use client";

import { motion } from "motion/react";
import { FileCheck2, Sparkles, MessagesSquare, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuroraText } from "@/components/ui/aurora-text";

const features = [
  {
    icon: FileCheck2,
    title: "Verified Claim Workflow",
    description:
      "Submit a written claim with unique identifiers. The finder reviews it and approves or denies before anything changes hands. Every return is confirmed by both sides and administrators, reducing fraud and disputes.",
  },
  {
    icon: Sparkles,
    title: "Real-Time AI Moderation",
    description:
      "Every new listing and claim are automatically evaluated by AI the moment it's posted. Spam, fraudulent reports, and inappropriate content are silently flagged for admin review before other users ever see them.",
  },
  {
    icon: MessagesSquare,
    title: "Pre-Claim Item Inquiries",
    description:
      "Not 100% sure it's yours? Send a direct inquiry to the finder. Ask about distinguishing features or contents and get a response quickly.",
  },
  {
    icon: Mail,
    title: "Instant Email Notifications",
    description:
      "Get notified the moment something happens. When your claim is approved, when someone inquires about your listing, or when an inquiry you sent gets a response. Never miss a beat.",
  },
];

export function FeaturesSection() {
  return (
    <section aria-label="Features" className="py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="font-semibold text-sm uppercase tracking-widest mb-3 font-mono">
            Features
          </p>
          <h2 className="text-3xl md:text-6xl font-bold font-sans text-balance">
            Built for speed, accuracy, and <AuroraText>trust.</AuroraText>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-relaxed font-sans">
            Every feature is designed to get lost items back to their owners as
            fast as possible while keeping the platform clean and safe.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col shadow-none">
              <CardHeader>
                <div className="flex items-center justify-center size-12 rounded-xl bg-primary text-white mb-2">
                  <feature.icon aria-hidden="true" className="size-6" />
                </div>
                <h3 className="text-xl font-bold font-sans">{feature.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed font-sans">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
