import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/claims/ongoing
 * Returns all claims made by the authenticated user where the item has
 * NOT yet been resolved (status is "unclaimed" or "found"), meaning the
 * claim is still pending a decision.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  const { data: claims, error } = await supabase
    .from("claims")
    .select(
      `
      *,
      claimed_item:items!claim_claimed_item_fkey (
        *,
        posted_by:users!items_posted_by_fkey (id, name),
        claimed_by:users!items_claimed_by_fkey (id, name)
      )
    `,
    )
    .eq("claimant", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Ongoing = claims where the item has NOT yet been returned (status != "claimed")
  const ongoingClaims = (claims ?? []).filter(
    (c) => c.claimed_item?.status !== "claimed",
  );

  return NextResponse.json(ongoingClaims);
}
