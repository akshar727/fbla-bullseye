import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET /api/admin/exchanges
 * Returns all rooms that have a pending proposed_time (not yet approved/denied).
 */
export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase
    .from("rooms")
    .select(
      `
      id,
      proposed_time,
      time_accepted,
      created_at,
      user1:users!rooms_user1_fkey (id, name, email),
      user2:users!rooms_user2_fkey (id, name, email),
      claim:claims!rooms_claim_fkey (
        id,
        claimed_item:items!claim_claimed_item_fkey (id, name)
      )
    `,
    )
    .not("proposed_time", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/exchanges
 * Body: { id: number, action: "approve" | "deny" }
 * Approves or denies a proposed exchange time.
 * - approve: sets exchange_approved = true
 * - deny: clears proposed_time and resets exchange_approved to null
 */
export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { id, action } = body;

  if (!id || !action || !["approve", "deny"].includes(action)) {
    return NextResponse.json(
      { error: "id and action ('approve' or 'deny') are required" },
      { status: 400 },
    );
  }

  const update =
    action === "approve"
      ? { time_accepted: true }
      : { proposed_time: null, time_accepted: false };

  const { error } = await supabase.from("rooms").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, action });
}
