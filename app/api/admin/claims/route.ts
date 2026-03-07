import { NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import log from "@/lib/dbLogger";

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: claims, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      claimant (id, name, email),
      extra_descriptions,
      proof_of_ownerships,
      created_at,
      claimed_item (
        id,
        name,
        status
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(claims);
}

export async function DELETE(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids : [];

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "At least one claim id is required" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("claims").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}

export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { id, action } = body;

  if (!id || !action || !["accept", "deny"].includes(action)) {
    return NextResponse.json(
      { error: "id and action ('accept' or 'deny') are required" },
      { status: 400 },
    );
  }

  const {
    data: claim,
    error: fetchError,
  }: {
    data: {
      id: string;
      claimant: { id: string; name: string; email: string };
      claimed_item: { id: string; name: string };
    } | null;
    error: any;
  } = await supabase
    .from("claims")
    .select(
      "id, claimant (id, name, email), claimed_item:items!claim_claimed_item_fkey (id, name)",
    )
    .eq("id", id)
    .single();

  if (fetchError || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  if (action === "accept") {
    const { error: updateError } = await supabase
      .from("items")
      .update({
        claimed_by: claim.claimant.id,
        status: "claimed",
        date_returned: new Date().toISOString(),
      })
      .eq("id", claim.claimed_item.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    after(() =>
      log(
        "Claim approved",
        `${claim.claimed_item.name} claimed by ${claim.claimant.name}`,
      ).catch(console.error),
    );
  } else {
    // deny — delete the claim so it disappears from the user's ongoing claims
    const { error: deleteError } = await supabase
      .from("claims")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, action });
}
