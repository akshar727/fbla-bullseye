import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

const SPAM_THRESHOLD = 0.6;

/**
 * GET /api/admin/items/spam
 * Returns all items flagged as likely spam (spam_likeliness >= 0.6).
 */
export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const { data: items, error } = await supabase
    .from("items")
    .select(
      `
      id,
      name,
      category,
      description,
      status,
      last_location,
      date_lost,
      image_urls,
      created_at,
      spam_likeliness,
      posted_by (id, name)
    `,
    )
    .gte("spam_likeliness", SPAM_THRESHOLD)
    .order("spam_likeliness", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(items ?? []);
}

/**
 * PATCH /api/admin/items/spam
 * Restores a spam-flagged item by resetting its spam_likeliness to 0.
 * Body: { id: string }
 */
export async function PATCH(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const id = String(body?.id ?? "").trim();

  if (!id) {
    return NextResponse.json({ error: "Item id is required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("items")
    .update({ spam_likeliness: 0 })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/admin/items/spam
 * Permanently deletes one or more spam-flagged items.
 * Body: { ids: string[] }
 */
export async function DELETE(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const ids = Array.isArray(body?.ids) ? body.ids : [];

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "At least one item id is required" },
      { status: 400 },
    );
  }

  const { error } = await supabase.from("items").delete().in("id", ids);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}
