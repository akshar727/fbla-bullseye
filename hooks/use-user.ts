import { useEffect, useState } from "react";
import { AuthError, Session, User } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

import { createClient } from "@/lib/supabase/client";

type SupabaseJwtPayload = JwtPayload & {
  app_metadata: {
    role: string;
  };
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [u_loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [psets, setPsets] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setSession(session);
          setUser(session.user);
          console.log(session.user.id);
          const { data, error: userError } = await supabase
            .from("users")
            .select("psets")
            .eq("id", session.user.id)
            .single();
          if (userError) {
            setError(error);
          } else if (data) {
            setPsets(JSON.parse(data.psets) ?? null);
          }
        }
      } catch (error) {
        setError(error as AuthError);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { u_loading, error, session, user, psets };
}
