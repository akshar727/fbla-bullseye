import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/inquiry
 * Returns all inquiry rows where the authenticated user is the inquirer.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: inquiries, error } = await supabase
    .from("inquiries")
    .select("*, inquired_item:items(id, name, category, status)")
    .eq("inquirer", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(inquiries);
}

/**
 * POST /api/inquiry
 * Body: { inquiry_text: string, inquired_item: string }
 * Creates a new inquiry row for the authenticated user.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { inquiry_text, inquired_item } = body ?? {};

  if (
    !inquiry_text ||
    typeof inquiry_text !== "string" ||
    !inquiry_text.trim()
  ) {
    return NextResponse.json(
      { error: "inquiry_text is required" },
      { status: 400 },
    );
  }

  if (!inquired_item || typeof inquired_item !== "string") {
    return NextResponse.json(
      { error: "inquired_item is required" },
      { status: 400 },
    );
  }

  const { error: insertError } = await supabase.from("inquiries").insert({
    inquirer: user.id,
    inquired_item,
    inquiry_text: inquiry_text.trim(),
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(
    { message: "Inquiry submitted successfully" },
    { status: 201 },
  );
}
