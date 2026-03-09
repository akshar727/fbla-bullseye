import Footer from "@/components/footer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Bullseye",
  description: "Privacy Policy for Bullseye Lost & Found",
};

const LAST_UPDATED = "March 8, 2026";
const PLATFORM_NAME = "Bullseye Lost & Found";
const SCHOOL_NAME = "Hickory Ridge High School";
const CONTACT_EMAIL = "hrhsbullseye@gmail.com";

export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            This Privacy Policy describes how <strong>{PLATFORM_NAME}</strong>,
            operated by {SCHOOL_NAME}, collects, uses, and protects information
            when you use this platform. By using Bullseye you agree to the
            practices described below.
          </p>

          <Section title="1. Information We Collect">
            <p className="mb-2">
              We collect only the minimum information necessary to operate the
              service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account information</strong> — your name and email
                address, provided when you register or sign in via Google OAuth
                or email/password.
              </li>
              <li>
                <strong>Item listings</strong> — item name, category,
                description, last-known location, date lost/found, and any
                photos you upload.
              </li>
              <li>
                <strong>Claims and inquiries</strong> — the text of any claim
                justification or item inquiry message you submit.
              </li>
              <li>
                <strong>Usage data</strong> — standard server logs (IP address,
                browser type, pages visited) retained for security and
                performance monitoring.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <p className="mb-2">Information is used solely to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Create and maintain your account and authenticate you securely.
              </li>
              <li>
                Display item listings, process claims, and facilitate the return
                of lost property.
              </li>
              <li>
                Send transactional emails (e.g. claim notifications, inquiry
                replies) directly related to your activity on the platform.
              </li>
              <li>
                Detect and filter spam or inappropriate content using automated
                AI review (Google Gemini). Content sent for review is not stored
                by the AI provider beyond the duration of the request.
              </li>
              <li>
                Administer the platform and investigate reports of misuse.
              </li>
            </ul>
            <p className="mt-2">
              We do <strong>not</strong> use your information for advertising,
              sell it to third parties, or share it for any purpose unrelated to
              operating this lost-and-found service.
            </p>
          </Section>

          <Section title="3. Cookies and Sessions">
            <p>
              Bullseye uses browser cookies solely to maintain your
              authenticated session. No tracking or advertising cookies are set.
              Session cookies are cleared when you sign out or when your session
              expires.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p className="mb-2">
              We rely on the following trusted third-party services to operate
              the platform. Each service processes only the data necessary for
              its function:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Supabase</strong> — database, authentication, and file
                storage. Your account credentials and uploaded images are stored
                on Supabase infrastructure. See{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 text-foreground"
                >
                  Supabase&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Google Gemini</strong> — AI-powered content moderation
                to detect spam and inappropriate listings. Listing text is sent
                to the API transiently and is not retained for model training
                under our usage agreement.
              </li>
              <li>
                <strong>Vercel</strong> — hosting and edge network for the web
                application. See{" "}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 text-foreground"
                >
                  Vercel&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>UserWay</strong> — accessibility widget embedded on all
                pages to meet WCAG standards. See{" "}
                <a
                  href="https://userway.org/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 text-foreground"
                >
                  UserWay&apos;s Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong>Resend</strong> — transactional email delivery for
                notifications and confirmations. Email addresses are shared with
                Resend only to deliver messages you trigger.
              </li>
            </ul>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Your account data and item listings are retained for as long as
              your account is active or as needed to operate the service. When
              an item is deleted by its owner or an administrator, associated
              images are removed from storage. You may request full deletion of
              your account and associated data at any time by contacting us at
              the email below.
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              All data is transmitted over HTTPS. Authentication tokens are
              managed by Supabase and are never exposed client-side in an
              insecure manner. Uploaded images are stored in access-controlled
              Supabase Storage buckets. We follow reasonable security practices;
              however, no system is completely immune from risk, and we cannot
              guarantee absolute security.
            </p>
          </Section>

          <Section title="7. Children's Privacy">
            <p>
              This platform is intended for high-school students (aged 14 and
              above) and school staff. We do not knowingly collect personal
              information from children under 13. If you believe a child under
              13 has created an account, please contact us immediately so we can
              remove that information.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Access</strong> — request a summary of the personal data
                we hold about you.
              </li>
              <li>
                <strong>Correction</strong> — update inaccurate information via
                your account settings or by contacting us.
              </li>
              <li>
                <strong>Deletion</strong> — request that your account and all
                associated personal data be permanently deleted.
              </li>
              <li>
                <strong>Portability</strong> — request a copy of your data in a
                machine-readable format.
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 text-foreground"
              >
                {CONTACT_EMAIL}
              </a>
              . We will respond within a reasonable timeframe.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. The &ldquo;Last
              updated&rdquo; date at the top of this page will always reflect
              the most recent revision. Continued use of the platform after
              changes are posted constitutes your acceptance of the updated
              policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions or concerns about this Privacy Policy or your data?
              Contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 text-foreground"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <div className="border-t pt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 text-foreground"
            >
              ← Back to home
            </Link>
            <Link
              href="/tos"
              className="underline underline-offset-4 text-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </section>
  );
}
