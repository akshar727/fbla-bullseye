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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Student form state
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [studentCaptchaToken, setStudentCaptchaToken] = useState<string | null>(
    null,
  );

  // Staff form state
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [staffCaptchaToken, setStaffCaptchaToken] = useState<string | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const nextPath = useMemo(() => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") ? next : "/browse";
  }, [searchParams]);

  async function signUpWithGoogle() {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
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
    if (!staffCaptchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setLoading(true);
    try {
      const verified = await verifyCaptcha(staffCaptchaToken);
      if (!verified) {
        toast.error("CAPTCHA verification failed. Please try again.");
        setStaffCaptchaToken(null);
        setLoading(false);
        return;
      }

      // TODO: Send staffCode to backend to verify it is a valid staff signup code.
      // If invalid, show an error and return early.

      const { error } = await supabase.auth.signUp({
        email: staffEmail,
        password: staffPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // TODO: After account creation, send a request to the backend with staffCode
      // to promote the newly created user to an admin/staff role.

      toast.success("Staff account created. Please login.");
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
        Continue with Google
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
          <Tabs defaultValue="student">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="student">Student Sign Up</TabsTrigger>
              <TabsTrigger value="staff">Staff Sign Up</TabsTrigger>
            </TabsList>

            {/* Student Sign Up */}
            <TabsContent value="student" className="space-y-4">
              <form onSubmit={handleStudentSignup} className="space-y-3">
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
                </div>

                <div className="flex justify-center scale-90 origin-top my-3">
                  <Recaptcha onVerify={setStudentCaptchaToken} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Sign Up
                </Button>
              </form>

              {sharedGoogleAndSignIn}
            </TabsContent>

            {/* Staff Sign Up */}
            <TabsContent value="staff" className="space-y-4">
              <form onSubmit={handleStaffSignup} className="space-y-3">
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="staff-code">Staff Signup Code</Label>
                  <Input
                    id="staff-code"
                    type="text"
                    value={staffCode}
                    onChange={(e) => setStaffCode(e.target.value)}
                    placeholder="Enter your staff signup code"
                    required
                  />
                </div>

                <div className="flex justify-center scale-90 origin-top my-3">
                  <Recaptcha onVerify={setStaffCaptchaToken} />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  Sign Up as Staff
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
    </Suspense>
  );
}
