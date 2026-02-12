import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  const supabase = await createClient();
  const { data: items, error } = await supabase
    .from("items")
    .select(
      `
    id,
    category,
    description,
    status,
    created_at,
    last_location,
    date_lost,
    date_found,
    image_urls,
    num_images,
    claimed_by,
    date_returned,
    posted_by:public_profiles (
      name
    )
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
