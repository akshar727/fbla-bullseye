"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import Footer from "@/components/footer";

function CompleteStaffContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const nextPath = searchParams.get("next") ?? "/dashboard";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/staff/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Invalid admin code. Please try again.");
        return;
      }
      toast.success("Admin account activated! Welcome.");
      router.push(nextPath.startsWith("/") ? nextPath : "/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <ShieldCheck className="size-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Complete Admin Registration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your admin signup code to activate your admin account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-code">Admin Signup Code</Label>
              <Input
                id="admin-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your admin code"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Activate Admin Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function CompleteAdminSignupPage() {
  return (
    <Suspense>
      <CompleteStaffContent />
      <Footer />
    </Suspense>
  );
}
