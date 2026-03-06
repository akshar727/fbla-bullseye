import "server-only";
import { NextResponse } from "next/server";
import { createClient as createAuthClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Verifies the incoming request is from a logged-in admin user.
 * Returns `supabase` as a service-role admin client (bypasses RLS).
 * Returns an errorResponse if the check fails — callers must short-circuit on it.
 */
export async function requireAdmin() {
  // Regular anon client — used only to verify the caller's session & role
  const authClient = await createAuthClient();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  // Admin client — returned for all subsequent DB operations
  const supabase = createAdminClient();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 },
      ),
    };
  }

  const { data, error: userError } = await authClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError) {
    return {
      supabase,
      user,
      errorResponse: NextResponse.json(
        { error: "Error fetching user role" },
        { status: 500 },
      ),
    };
  }

  if (data?.role !== "admin") {
    return {
      supabase,
      user,
      errorResponse: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { supabase, user, errorResponse: null as NextResponse | null };
}
