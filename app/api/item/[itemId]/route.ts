import { createClient } from "@/lib/supabase/server";
import type { ItemResponse } from "@/lib/types";
import { SPAM_THRESHOLD } from "@/lib/spamGuard";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: items, error }: { data: ItemResponse | null; error: any } =
    await supabase
      .from("items")
      .select(
        `
    *, posted_by:user_public_profiles!items_posted_by_fkey (id, name)
  `,
      )
      .eq("id", itemId)
      .single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Hide items flagged as spam from public view, but allow the owner to see their own
  if (
    items &&
    (items as ItemResponse & { spam_likeliness?: number | null })
      .spam_likeliness != null &&
    (items as ItemResponse & { spam_likeliness?: number | null })
      .spam_likeliness! >= SPAM_THRESHOLD
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const itemOwnerId = (items as any).posted_by?.id;
    if (!user) {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { data: roleData }: { data: { role: string } | null } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (user.id !== itemOwnerId && roleData?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { itemId } = await params;
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) {
    return new Response(JSON.stringify({ error: "Item not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (item.posted_by !== user.id) {
    return new Response(JSON.stringify({ error: "You do not own this item" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error: deleteError } = await supabase
    .from("items")
    .delete()
    .eq("id", itemId);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
