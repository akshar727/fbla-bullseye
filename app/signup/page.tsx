"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recaptcha } from "@/components/ui/recaptcha";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyCaptcha } from "@/lib/captcha";
import { toast } from "sonner";
import Footer from "@/components/footer";
import { cn } from "@/lib/utils";

type StrengthLevel = { label: string; color: string; bg: string; bars: number };

const STRENGTH_LEVELS: StrengthLevel[] = [
  { label: "Weak", color: "text-red-500", bg: "bg-red-500", bars: 1 },
  { label: "Fair", color: "text-orange-500", bg: "bg-orange-500", bars: 2 },
  { label: "Good", color: "text-yellow-500", bg: "bg-yellow-500", bars: 3 },
  { label: "Strong", color: "text-green-500", bg: "bg-green-500", bars: 4 },
];

function getStrength(password: string): {
  score: number;
  checks: { label: string; met: boolean }[];
} {
  const checks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  return { score: checks.filter((c) => c.met).length, checks };
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, checks } = getStrength(password);
  // score 1→index 0, 2→1, 3-4→2, 5→3
  const levelIndex = score <= 1 ? 0 : score === 2 ? 1 : score <= 4 ? 2 : 3;
  const level = STRENGTH_LEVELS[levelIndex];

  return (
    <div className="space-y-2 pt-1">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {STRENGTH_LEVELS.map((l, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i < level.bars ? level.bg : "bg-muted",
              )}
            />
          ))}
        </div>
        <span
          className={cn("text-xs font-medium w-12 text-right", level.color)}
        >
          {level.label}
        </span>
      </div>
      {/* Checklist */}
      <ul className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        {checks.map((c) => (
          <li
            key={c.label}
            className={cn(
              "flex items-center gap-1 text-xs",
              c.met ? "text-green-600" : "text-muted-foreground",
            )}
          >
            <span>{c.met ? "✓" : "○"}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Student form state
  const [studentFirstName, setStudentFirstName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentCaptchaToken, setStudentCaptchaToken] = useState<string | null>(
    null,
  );

  // Staff form state
  const [staffFirstName, setStaffFirstName] = useState("");
  const [staffLastName, setStaffLastName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [staffCaptchaToken, setStaffCaptchaToken] = useState<string | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<"student" | "staff">("student");
  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/browse";
  }, [searchParams]);

  async function signUpWithGoogle() {
    setLoading(true);
    try {
      const roleParam = activeTab === "staff" ? "&role=staff" : "";
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}${roleParam}`,
        },
      });
      if (error) throw error;
    } catch {
      toast.error(
        "There was an error signing up with Google. Please try again.",
      );
      setLoading(false);
    }
  }

  async function handleStudentSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (getStrength(studentPassword).score < 5) {
      toast.error("Please use a stronger password before signing up.");
      return;
    }
    if (!studentCaptchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setLoading(true);
    try {
      const verified = await verifyCaptcha(studentCaptchaToken);
      if (!verified) {
        toast.error("CAPTCHA verification failed. Please try again.");
        setStudentCaptchaToken(null);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: studentEmail,
        password: studentPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
          data: {
            first_name: studentFirstName.trim(),
            last_name: studentLastName.trim(),
            full_name: `${studentFirstName.trim()} ${studentLastName.trim()}`,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created. Please login.");
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStaffSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (getStrength(staffPassword).score < 5) {
      toast.error("Please use a stronger password before signing up.");
      return;
    }
    if (!staffCaptchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setLoading(true);
    try {
      // Validate staff code before creating the account
      const verifyRes = await fetch("/api/staff/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: staffCode.trim() }),
      });
      if (!verifyRes.ok) {
        const verifyData = await verifyRes.json();
        toast.error(verifyData?.error ?? "Invalid admin code.");
        setLoading(false);
        return;
      }
      const verified = await verifyCaptcha(staffCaptchaToken);
      if (!verified) {
        toast.error("CAPTCHA verification failed. Please try again.");
        setStaffCaptchaToken(null);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          data: {
            first_name: staffFirstName.trim(),
            last_name: staffLastName.trim(),
            full_name: `${staffFirstName.trim()} ${staffLastName.trim()}`,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }
      const res = await fetch("/api/staff/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: staffCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Invalid admin code. Please try again.");
        return;
      }

      toast.success("Admin account created. Please login.");
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const sharedGoogleAndSignIn = (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={signUpWithGoogle}
        disabled={loading}
      >
        Continue with Google{activeTab === "staff" ? " as Admin" : ""}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          className="underline underline-offset-4 text-foreground"
          onClick={() =>
            router.push(`/login?next=${encodeURIComponent(nextPath)}`)
          }
          disabled={loading}
        >
          Sign in
        </button>
      </p>
    </>
  );

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <p className="text-sm text-muted-foreground text-center">
            Sign up with email/password or Google
          </p>
        </CardHeader>

        <CardContent>
          <Tabs
            defaultValue="student"
            onValueChange={(v) => setActiveTab(v as "student" | "staff")}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="student">Student Sign Up</TabsTrigger>
              <TabsTrigger value="staff">Admin Sign Up</TabsTrigger>
            </TabsList>

            {/* Student Sign Up */}
            <TabsContent value="student" className="space-y-4">
              <form onSubmit={handleStudentSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="student-first-name">First Name</Label>
                    <Input
                      id="student-first-name"
                      type="text"
                      value={studentFirstName}
                      onChange={(e) => setStudentFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="student-last-name">Last Name</Label>
                    <Input
                      id="student-last-name"
                      type="text"
                      value={studentLastName}
                      onChange={(e) => setStudentLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="student-email">Email</Label>
                  <Input
                    id="student-email"
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="student-password">Password</Label>
                  <Input
                    id="student-password"
                    type="password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <PasswordStrength password={studentPassword} />
                </div>

                <div className="flex justify-center scale-90 origin-top my-3">
                  <Recaptcha onVerify={setStudentCaptchaToken} />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || getStrength(studentPassword).score < 5}
                >
                  Sign Up
                </Button>
              </form>

              {sharedGoogleAndSignIn}
            </TabsContent>

            {/* Staff Sign Up */}
            <TabsContent value="staff" className="space-y-4">
              <form onSubmit={handleStaffSignup} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-first-name">First Name</Label>
                    <Input
                      id="staff-first-name"
                      type="text"
                      value={staffFirstName}
                      onChange={(e) => setStaffFirstName(e.target.value)}
                      placeholder="Jane"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-last-name">Last Name</Label>
                    <Input
                      id="staff-last-name"
                      type="text"
                      value={staffLastName}
                      onChange={(e) => setStaffLastName(e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staff-email">Email</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-password">Password</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <PasswordStrength password={staffPassword} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-code">Admin Signup Code</Label>
                  <Input
                    id="staff-code"
                    type="text"
                    value={staffCode}
                    onChange={(e) => setStaffCode(e.target.value)}
                    placeholder="Enter your admin signup code"
                    required
                  />
                </div>

                <div className="flex justify-center scale-90 origin-top my-3">
                  <Recaptcha onVerify={setStaffCaptchaToken} />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || getStrength(staffPassword).score < 5}
                >
                  Sign Up as Admin
                </Button>
              </form>

              {sharedGoogleAndSignIn}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
      <Footer />
    </Suspense>
  );
}
