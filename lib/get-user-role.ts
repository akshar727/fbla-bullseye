import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function getUserRole() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return undefined;

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch user role:", error);
    return undefined;
  }

  return data?.role as string | undefined;
}
