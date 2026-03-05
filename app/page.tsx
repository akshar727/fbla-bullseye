"use client";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <HeroSection />
      <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-bold text-center">
              Bullseye Lost & Found
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Report lost items, browse listings, and submit claims.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push("/login")}>
              Log In
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/signup")}
            >
              Sign Up
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push("/browse")}
            >
              Continue as Guest
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
