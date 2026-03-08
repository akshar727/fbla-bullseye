import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/emails";
import { after } from "next/server";
import log from "@/lib/dbLogger";
import { evaluateItem, SPAM_THRESHOLD } from "@/lib/spamGuard";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const status = searchParams.get("status");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if the requester is an admin — admins see all items including spam
  let isAdmin = false;
  if (user) {
    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = roleData?.role === "admin";
  }

  // Admins see everything; owners see their own spam items; others never see spam
  const spamFilter =
    user && !isAdmin
      ? `spam_likeliness.is.null,spam_likeliness.lt.${SPAM_THRESHOLD},posted_by.eq.${user.id}`
      : `spam_likeliness.is.null,spam_likeliness.lt.${SPAM_THRESHOLD}`;

  let query = supabase
    .from("items")
    .select(
      "*, posted_by:user_public_profiles!items_posted_by_fkey (id, name)",
    );

  if (!isAdmin) {
    query = query.or(spamFilter);
  }

  if (category) {
    query = query.eq("category", category);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data: items, error } = await query;
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

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify the user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const last_location = formData.get("last_location") as string;
  const date_lost = formData.get("date_lost") as string | null;

  // Upload each image to Supabase Storage and collect public URLs
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  for (const image of imageFiles) {
    if (!image || image.size === 0) continue;
    const ext = image.name.split(".").pop() ?? "jpg";
    const path = `lost/${crypto.randomUUID()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("item_images")
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("item_images").getPublicUrl(uploadData.path);

    imageUrls.push(publicUrl);
  }

  const { data: item, error } = await supabase
    .from("items")
    .insert({
      name,
      category,
      description,
      status: "unclaimed",
      last_location,
      date_lost: date_lost || null,
      date_found: null,
      image_urls: imageUrls,
      num_images: imageUrls.length,
      posted_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  after(() =>
    log("New item uploaded", `${name} found at ${last_location}`).catch(
      console.error,
    ),
  );

  // Run spam evaluation asynchronously after response
  after(async () => {
    try {
      const score = await evaluateItem(item.id);
      const adminClient = createAdminClient();
      await adminClient
        .from("items")
        .update({ spam_likeliness: score })
        .eq("id", item.id);
      if (score >= SPAM_THRESHOLD) {
        await log(
          "Spam Detected",
          `Item "${name}" (${item.id}) flagged with spam score ${Math.round(score * 100)}%`,
        );
      }
    } catch (err) {
      console.error("[spamGuard] Item spam evaluation failed:", err);
    }
  });

  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
