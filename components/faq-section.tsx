"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Who can use Bullseye?",
    answer:
      "Bullseye is available to all current students, faculty, and staff at Hickory Ridge High School.",
  },
  {
    question: "How does the claim process work?",
    answer:
      "Browse the listings and click on an item that matches what you lost. Submit a written claim explaining why the item is yours. The person who found it will review your claim and approve or deny it. Once approved, you can coordinate pickup through the platform.",
  },
  {
    question: "What happens after a claim is approved?",
    answer:
      "Once a claim is approved the item is marked as claimed. Both parties can then coordinate the physical return through school staff.",
  },
  {
    question: "Why is my listing not visible to other users?",
    answer:
      "Every new listing is automatically reviewed by our AI moderation system. If it's flagged for review, it will show as \"Under Admin Review\" on your dashboard and won't be visible to others until an administrator clears it. This usually takes very little time.",
  },
  {
    question: "Who do I contact if I have a problem?",
    answer:
      "Reach out to the Bullseye web team at hrhsbullseye@gmail.com or visit the Contact page for more options including phone support.",
  },
];

export function FaqSection() {
  return (
    <section className="py-24 md:py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <p className="text-primary font-mono font-semibold text-sm uppercase tracking-widest mb-3">
            FAQ
          </p>
          <h2 className="text-primary text-3xl md:text-6xl font-bold text-balance">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg leading-relaxed">
            Everything you need to know about using Bullseye.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-2">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border rounded-xl px-5"
              >
                <AccordionTrigger className="text-left hover:cursor-pointer font-semibold text-base py-5 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
