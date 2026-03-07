import Footer from "@/components/footer";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Bullseye",
  description: "Terms of Service for Bullseye Lost & Found",
};

const LAST_UPDATED = "March 6, 2026";
const SCHOOL_NAME = "Bullseye Lost & Found";
const CONTACT_EMAIL = "hrhsbullseye@gmail.com";

export default function TermsOfServicePage() {
  return (
    <>
      <main className="min-h-screen bg-muted/30 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Terms of Service
            </h1>
            <p className="text-sm text-muted-foreground">
              Last updated: {LAST_UPDATED}
            </p>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            Welcome to <strong>{SCHOOL_NAME}</strong>. By accessing or using
            this platform you agree to be bound by these Terms of Service. If
            you do not agree, please do not use the service.
          </p>

          <Section title="1. About the Service">
            <p>
              {SCHOOL_NAME} is a school-operated lost-and-found platform that
              allows students and staff to report found items, search for lost
              belongings, and submit claims. The service is intended solely for
              use by current students, faculty, and staff of the school
              community.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be a current student, faculty member, or authorized staff
              member to create an account. By registering, you represent that
              the information you provide is accurate and that you are
              authorized to use the service. Accounts found to belong to
              unauthorized individuals may be suspended or removed at any time.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
              <li>
                You must notify an administrator immediately if you believe your
                account has been compromised.
              </li>
              <li>
                Staff accounts require a valid staff signup code. Misuse of
                staff codes is a violation of these terms.
              </li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p className="mb-2">
              You agree <strong>not</strong> to:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Post false, misleading, or fraudulent lost/found reports or
                claims.
              </li>
              <li>Attempt to claim items that do not belong to you.</li>
              <li>
                Upload content that is offensive, harmful, or violates any
                applicable law.
              </li>
              <li>
                Use the platform to harass, threaten, or impersonate other
                users.
              </li>
              <li>
                Attempt to circumvent any security, authentication, or access
                control measures.
              </li>
              <li>
                Scrape, copy, or redistribute platform data without written
                permission.
              </li>
            </ul>
          </Section>

          <Section title="5. Item Listings and Claims">
            <p>
              When you report a found item or submit a claim, you agree that the
              information provided is truthful to the best of your knowledge.
              Submitting a fraudulent claim or false found-item report may
              result in permanent account suspension and referral to school
              administration. The platform does not guarantee the return of any
              lost item and acts only as a matching intermediary.
            </p>
          </Section>

          <Section title="6. Content and Images">
            <p>
              By uploading photos or other content to {SCHOOL_NAME}, you grant
              the platform a non-exclusive, royalty-free license to display that
              content solely for the purpose of operating the service. You
              retain ownership of your content. You must not upload images of
              people without their consent or any content that violates
              copyright.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              We collect only the information necessary to operate the service
              (name, email address, and content you submit). We do not sell or
              share your personal information with third parties for marketing
              purposes. Authentication is handled securely via Supabase. For
              questions about your data, contact us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 text-foreground"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="8. Moderation and Enforcement">
            <p>
              Administrators reserve the right to remove any listing, claim, or
              account that violates these terms or is otherwise deemed
              inappropriate, without prior notice. Repeated violations may
              result in permanent removal from the platform and referral to
              school disciplinary processes.
            </p>
          </Section>

          <Section title="9. Disclaimers">
            <p>
              The service is provided <strong>"as is"</strong> without
              warranties of any kind. We do not guarantee the accuracy of any
              item listing, the successful return of any item, or uninterrupted
              availability of the platform. To the fullest extent permitted by
              law, the school and its operators are not liable for any loss or
              damage arising from use of the service.
            </p>
          </Section>

          <Section title="10. Changes to These Terms">
            <p>
              We may update these Terms of Service from time to time. Continued
              use of the platform after changes are posted constitutes
              acceptance of the revised terms. The "Last updated" date at the
              top of this page will always reflect the most recent revision.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions or concerns about these terms? Reach us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 text-foreground"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <div className="border-t pt-6 text-sm text-muted-foreground">
            <Link
              href="/"
              className="underline underline-offset-4 text-foreground"
            >
              ← Back to home
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
