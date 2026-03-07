import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
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

  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("notified_user", user.id)
    .eq("viewed", false)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(notifications);
}

export async function PATCH(request: Request) {
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
  const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ viewed: true })
    .in("id", ids)
    .eq("notified_user", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
