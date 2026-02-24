import { createClient } from "@/lib/supabase/server";
import type { ItemResponse } from "@/lib/types";

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
    *, claimed_by(name,id)
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
  return new Response(JSON.stringify(items), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(
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

  const { error: updateError } = await supabase
    .from("items")
    .update({ status: "found" })
    .eq("id", itemId);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
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
