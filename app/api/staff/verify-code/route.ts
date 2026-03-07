import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/staff/verify-code
 * Body: { code: string }
 * Verifies the staff signup code and promotes the current user to admin role.
 * Called from /signup/complete after a Google OAuth staff signup.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized - Please log in" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const code = String(body?.code ?? "").trim();

  if (!code) {
    return NextResponse.json(
      { error: "Staff code is required" },
      { status: 400 },
    );
  }

  const validCode = process.env.STAFF_SIGNUP_CODE;
  if (!validCode || code !== validCode) {
    return NextResponse.json({ error: "Invalid staff code" }, { status: 403 });
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient
    .from("users")
    .update({ role: "admin" })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
