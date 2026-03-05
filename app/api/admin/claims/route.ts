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

  const { data: claims, error } = await supabase
    .from("claims")
    .select(
      `
      id,
      claimant,
      extra_descriptions,
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
