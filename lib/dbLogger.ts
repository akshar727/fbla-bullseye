import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function log(header: string, message: string) {
  const supabase = createAdminClient();
  await supabase.from("logs").insert({ header, message });
}
