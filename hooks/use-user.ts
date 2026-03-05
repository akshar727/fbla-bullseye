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

  async function syncSession(session: Session | null) {
    if (session) {
      setSession(session);
      setUser(session.user);
      const { data, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();
      if (!userError && data) {
        setIsAdmin(data.role === "admin");
      }
    } else {
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        syncSession(session);
      }
    });

    // Listen for sign-in / sign-out events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { u_loading, error, session, user, isAdmin };
}
