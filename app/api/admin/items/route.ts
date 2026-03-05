import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 },
      ),
    };
  }

  const { data, error: userError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userError) {
    return {
      supabase,
      user,
      errorResponse: NextResponse.json(
        { error: "Error fetching user role" },
        { status: 500 },
      ),
    };
  }

  const isAdmin = data?.role === "admin";
  if (!isAdmin) {
    return {
      supabase,
      user,
      errorResponse: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 },
      ),
    };
  }

  return { supabase, user, errorResponse: null as NextResponse | null };
}

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
      created_at,
      posted_by (id, name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const body = await request.json();
  const name = String(body?.name ?? "").trim();
  const category = String(body?.category ?? "").trim();
  const last_location = String(body?.last_location ?? "").trim();

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      name,
      category: category.toLowerCase(),
      last_location,
      status: "unclaimed",
      posted_by: body?.posted_by || null,
      date_lost: body?.date_lost || new Date().toISOString(),
      description: body?.description || null,
    })
    .select(
      `
      id,
      name,
      category,
      status,
      last_location,
      date_lost,
      created_at,
      posted_by (id, name)
    `,
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

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
