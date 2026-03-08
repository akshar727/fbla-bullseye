import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/account
 * Returns the current user's profile data.
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

  const { data, error } = await supabase
    .from("users")
    .select("id, name, email, send_email_notifs")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Split full name into first / last
  const nameParts = (data.name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return NextResponse.json({
    firstName,
    lastName,
    email: data.email,
    send_email_notifs: data.send_email_notifs ?? false,
  });
}

/**
 * PATCH /api/account
 * Body: { firstName?, lastName?, send_email_notifs? }
 * Updates the current user's name and notification preference.
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : undefined;
  const lastName =
    typeof body.lastName === "string" ? body.lastName.trim() : undefined;
  const send_email_notifs =
    typeof body.send_email_notifs === "boolean"
      ? body.send_email_notifs
      : undefined;

  if (firstName !== undefined && !firstName) {
    return NextResponse.json(
      { error: "First name cannot be empty" },
      { status: 400 },
    );
  }

  // Build the users table update payload
  const updates: Record<string, unknown> = {};
  if (firstName !== undefined || lastName !== undefined) {
    // Fetch current name so we can splice in only the changed part
    const { data: current } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .single();
    const currentParts = (current?.name ?? "").trim().split(/\s+/);
    const newFirst = firstName ?? currentParts[0] ?? "";
    const newLast =
      lastName !== undefined ? lastName : currentParts.slice(1).join(" ");
    updates.name = [newFirst, newLast].filter(Boolean).join(" ");
  }
  if (send_email_notifs !== undefined)
    updates.send_email_notifs = send_email_notifs;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/account
 * Permanently deletes the current user's account (auth + profile row).
 */
export async function DELETE() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Delete the auth user — the users table row should cascade via FK/trigger
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  // Sign out any active sessions on the server
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
