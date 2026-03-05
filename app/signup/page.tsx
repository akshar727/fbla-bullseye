"use client";

import { Suspense, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Recaptcha } from "@/components/ui/recaptcha";
import { verifyCaptcha } from "@/lib/captcha";
import { toast } from "sonner";

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA");
      return;
    }
    setLoading(true);
    try {
      // Verify CAPTCHA first
      const verified = await verifyCaptcha(captchaToken);

      if (!verified) {
        toast.error("CAPTCHA verification failed. Please try again.");
        setCaptchaToken(null);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(
        "Account created.Please login.",
      );
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

        <CardContent className="space-y-4">
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-center scale-90 origin-top my-3">
              <Recaptcha onVerify={setCaptchaToken} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              Sign Up
            </Button>
          </form>

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
