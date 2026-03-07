import { NextResponse, after } from "next/server";
import { render } from "@react-email/components";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/emails";
import InquiryRespondedEmail from "@/components/email/inquiry-responded";

/**
 * PATCH /api/inquiry/[inquiryId]
 * Body: { response: string }
 * Saves a response to the inquiry. Only the owner of the inquired item may respond.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ inquiryId: string }> },
) {
  const supabase = await createClient();
  const { inquiryId } = await params;

  // Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { response } = body ?? {};

  if (!response || typeof response !== "string" || !response.trim()) {
    return NextResponse.json(
      { error: "response is required" },
      { status: 400 },
    );
  }

  // Fetch the inquiry and join the item + inquirer so we can verify ownership
  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .select(
      `
      id,
      inquiry_text,
      inquirer:users!inquiries_inquirer_fkey (id, name),
      inquired_item:items!inquiries_inquired_item_fkey (
        id,
        name,
        posted_by
      )
    `,
    )
    .eq("id", inquiryId)
    .single();

  if (inquiryError || !inquiry) {
    return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
  }

  // Ownership check — only the poster of the item may respond
  if ((inquiry.inquired_item as any).posted_by !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Persist the response
  const { error: updateError } = await supabase
    .from("inquiries")
    .update({ inquiry_response: response.trim() })
    .eq("id", inquiryId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Fetch responder name for the notification message
  const { data: responder } = await supabase
    .from("users")
    .select("name")
    .eq("id", user.id)
    .single();

  const responderName = responder?.name ?? "The item owner";
  const inquirer = inquiry.inquirer as any;
  const item = inquiry.inquired_item as any;
  const inquirerFirstName = (inquirer.name as string).split(" ")[0];

  const emailHtml = await render(
    <InquiryRespondedEmail
      name={inquirerFirstName}
      itemName={item.name}
      response={response.trim()}
    />,
  );

  after(() =>
    notify(
      { id: inquirer.id, name: inquirer.name },
      "Response to your inquiry",
      `${responderName} responded to your inquiry about "${item.name}"`,
      emailHtml,
    ).catch(console.error),
  );

  return NextResponse.json({ ok: true });
}
