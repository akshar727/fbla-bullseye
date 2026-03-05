import { useEffect, useState } from "react";
import { AuthError, Session, User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/client";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [u_loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const supabase = createClient();

  const [isAdmin, setIsAdmin] = useState(false);

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
          const { data, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", session.user.id)
            .single();
          if (userError) {
            setError(error);
          } else if (data) {
            setIsAdmin(data.role === "admin");
          }
          setUser(session.user);
          console.log("Supabase user:", session.user);
        }
      } catch (error) {
        setError(error as AuthError);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { u_loading, error, session, user, isAdmin };
}
