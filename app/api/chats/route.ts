import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      time_accepted,
      proposed_time,
      created_at,
      user1:users!rooms_user1_fkey (id, name),
      user2:users!rooms_user2_fkey (id, name),
      claim:claims!rooms_claim_fkey (
        id,
        claimed_item:items!claim_claimed_item_fkey (id, name)
      ),
      messages (
        id,
        content,
        created_at
      )
    `,
    )
    .or(`user1.eq.${user.id},user2.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
