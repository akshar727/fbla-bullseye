import { notify } from "@/lib/emails";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, after } from "next/server";
import { render } from "@react-email/components";
import NewInquiryEmail from "@/components/email/new-inquiry";
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
  const { data: item, error: itemError } = await supabase
    .from("items")
    .select("*, posted_by:users!items_posted_by_fkey (id, name)")
    .eq("id", inquired_item)
    .single();

  if (itemError || !item) {
    return NextResponse.json(
      { error: "Inquired item not found" },
      { status: 404 },
    );
  }

  const { error: insertError } = await supabase.from("inquiries").insert({
    inquirer: user.id,
    inquired_item,
    inquiry_text: inquiry_text.trim(),
  });
  const { data: inquirerName, error: inquirerError } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  if (insertError || inquirerError) {
    return NextResponse.json(
      {
        error: insertError
          ? insertError.message
          : inquirerError
            ? inquirerError.message
            : "",
      },
      { status: 500 },
    );
  }
  console.log("notifyimng");
  const emailHtml = await render(
    <NewInquiryEmail
      name={item.posted_by?.name.split(" ")[0] ?? "User"}
      itemName={item.name}
    />,
  );
  after(() =>
    notify(
      item.posted_by,
      "New inquiry for your item",
      `${inquirerName?.name.split(" ")[0] ?? "User"} has inquired about your item "${item.name}"`,
      emailHtml,
    ).catch((err) => console.error("Error sending notification email:", err)),
  );

  return NextResponse.json(
    { message: "Inquiry submitted successfully" },
    { status: 201 },
  );
}
