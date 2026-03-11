import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(request: Request) {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const formData = await request.formData();
  const itemId = formData.get("itemId") as string;

  if (!itemId) {
    return NextResponse.json({ error: "itemId is required" }, { status: 400 });
  }

  // Fetch existing image_urls so we can append rather than overwrite
  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("image_urls, num_images")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const imageFiles = formData.getAll("images") as File[];
  if (imageFiles.length === 0) {
    return NextResponse.json({ error: "No images provided" }, { status: 400 });
  }

  const newUrls: string[] = [];

  for (const image of imageFiles) {
    if (!image || image.size === 0) continue;
    const ext = image.name.split(".").pop() ?? "jpg";
    const path = `lost/${crypto.randomUUID()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("item_images")
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("item_images").getPublicUrl(uploadData.path);

    newUrls.push(publicUrl);
  }

  if (newUrls.length === 0) {
    return NextResponse.json({ error: "All uploads failed" }, { status: 500 });
  }

  const mergedUrls = [...(item.image_urls ?? []), ...newUrls];

  const { error: updateError } = await supabase
    .from("items")
    .update({ image_urls: mergedUrls, num_images: mergedUrls.length })
    .eq("id", itemId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    added: newUrls.length,
    urls: newUrls,
  });
}
