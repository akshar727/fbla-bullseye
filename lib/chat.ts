import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createRoom(
  user1: { id: string; name: string },
  user2: { id: string; name: string },
  claim: { id: string },
) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("rooms")
    .insert({
      user1: user1.id,
      user2: user2.id,
      claim: claim.id,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
