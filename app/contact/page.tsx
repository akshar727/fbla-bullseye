import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/footer";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  HelpCircle,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact — Bullseye",
  description:
    "Get in touch with the Bullseye Lost & Found team at Hickory Ridge High School.",
};

const CONTACT_EMAIL = "hrhsbullseye@gmail.com";
const CONTACT_PHONE = "(704) 535-1934";
const SCHOOL_NAME = "Hickory Ridge High School";
const SCHOOL_ADDRESS_1 = "7321 Raging Ridge Rd";
const SCHOOL_ADDRESS_2 = "Harrisburg, NC 28075";
const SCHOOL_URL = "https://hrhs.cabarrus.k12.nc.us/";

export default function ContactPage() {
  return (
    <>
      <main className="min-h-screen bg-muted/30">
        {/* Hero */}
        <div className="bg-primary text-white py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-3">
            <h1 className="text-4xl font-bold">Contact &amp; Support</h1>
            <p className="text-white/80 text-lg">
              Have a question about a claim, item, or your account? We&apos;re
              here to help.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
          {/* Contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  For general questions, claim disputes, or account issues.
                </p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="font-medium text-primary hover:underline underline-offset-4 break-all"
                >
                  {CONTACT_EMAIL}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  Call Bullseye Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  For urgent matters regarding a lost item, contact our support
                  directly to get personalized help.
                </p>
                <a
                  href={`tel:+17045351934`}
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  {CONTACT_PHONE}
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  School Website
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Find announcements, staff directories, and more.
                </p>
                <a
                  href={SCHOOL_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-primary hover:underline underline-offset-4"
                >
                  hrhs.cabarrus.k12.nc.us ↗
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Web team */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                Web Team
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
              <p>
                Bullseye was built and is maintained by the HRHS FBLA web
                development team.
              </p>
              <ul className="list-disc pl-5 pt-1 space-y-0.5">
                <li>Akshar Desai</li>
                <li>Kaushik Medamanuri</li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick help links */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HelpCircle
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              Quick Links
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/browse">
                  <Globe aria-hidden="true" className="size-4" />
                  Browse Found Items
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/tos">
                  <FileText aria-hidden="true" className="size-4" />
                  Terms of Service
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/privacy">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                  Privacy Policy
                </Link>
              </Button>
            </div>
          </div>

          {/* Response time note */}
          <p className="text-sm text-muted-foreground border-t pt-6">
            We typically respond to emails within{" "}
            <strong>1–2 school days</strong>. For urgent matters regarding a
            lost item, please call our support directly.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
