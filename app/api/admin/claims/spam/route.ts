import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

/**
 * GET /api/admin/claims/spam
 * Returns all claims with spam_likeliness >= 0.6 for admin review.
 */
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
      spam_likeliness,
      claimed_item (
        id,
        name,
        status
      )
    `,
    )
    .gte("spam_likeliness", 0.6)
    .order("spam_likeliness", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(claims);
}

/**
 * PATCH /api/admin/claims/spam
 * Body: { id: string }
 * Restores a spam-flagged claim by clearing its spam_likeliness score.
 */
export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Claim id is required" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("claims")
    .update({ spam_likeliness: 0 })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/claims/spam
 * Body: { ids: string[] }
 * Permanently deletes spam-flagged claims.
 */
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
