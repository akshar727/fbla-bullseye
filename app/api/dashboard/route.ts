import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/dashboard
 * Returns the authenticated user's posted lost items, each with their
 * associated claims (claimant info + proof images).
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: items, error } = await supabase
    .from("items")
    .select(
      `
      *,
      claimed_by(id, name, email),
      claims (
        id,
        claimant,
        extra_descriptions,
        proof_of_ownerships,
        created_at,
        spam_likeliness,
        rooms (id)
      ),
      inquiries (
        id,
        inquiry_text,
        created_at,
        inquirer(id, name, email)
      )
    `,
    )
    .eq("posted_by", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Strip out claims flagged as likely spam (score >= 0.6)
  const filtered = (items ?? []).map((item) => ({
    ...item,
    claims: (item.claims ?? []).filter(
      (c: { spam_likeliness: number | null }) =>
        c.spam_likeliness === null || c.spam_likeliness < 0.6,
    ),
  }));

  return NextResponse.json(filtered);
}
