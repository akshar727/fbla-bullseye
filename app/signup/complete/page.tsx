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
      const res = await fetch("/api/staff/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "Invalid staff code. Please try again.");
        return;
      }
      toast.success("Staff account activated! Welcome.");
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
            Complete Staff Registration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter your staff signup code to activate your staff account.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staff-code">Staff Signup Code</Label>
              <Input
                id="staff-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your staff code"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Activate Staff Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function CompleteStaffSignupPage() {
  return (
    <Suspense>
      <CompleteStaffContent />
      <Footer />
    </Suspense>
  );
}
