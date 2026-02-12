"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { toast } from "sonner";

export default function Home() {
  const supabase = createClient();
  const { u_loading, error, user, psets } = useUser();
  async function signInWithGoogle() {
    // setIsGoogleLoading(true);
    const next = window.location.pathname;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${
            next ? `?next=${encodeURIComponent(next)}` : ""
          }`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.error(
        "There was an error logging in with Google. Please try again.",
      );
      // setIsGoogleLoading(false);
    }
  }
  return (
    <>
      <Button
        onClick={signInWithGoogle}
        // disabled={isGoogleLoading}
        variant={"outline"}
      >
        Sign in with Google
      </Button>
      {u_loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <p>Your psets: {psets}</p>
        </div>
      ) : (
        <p>Please sign in to see your information.</p>
      )}
    </>
  );
}
