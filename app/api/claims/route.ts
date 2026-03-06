import { notify } from "@/lib/emails";
import { createClient } from "@/lib/supabase/server";
import { ItemResponse } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  const { data: claims, error } = await supabase
    .from("claims")
    .select("*, claimed_item(*)")
    .eq("claimant", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(claims);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const itemId = formData.get("itemId") as string;
  const extraDescriptions = formData.get("extraDescriptions") as string;

  // Verify item exists and is not already claimed
  const {
    data: item,
    error: itemError,
  }: { data: ItemResponse | null; error: any } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return new Response(JSON.stringify({ error: "Item not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (item.claimed_by !== null) {
    return new Response(
      JSON.stringify({ error: "Item has already been claimed" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Upload proof-of-ownership images to claim_images bucket
  const imageFiles = formData.getAll("proof_images") as File[];
  const proofUrls: string[] = [];

  for (const image of imageFiles) {
    if (!image || image.size === 0) continue;
    const ext = image.name.split(".").pop() ?? "jpg";
    const path = `claims/${itemId}/${crypto.randomUUID()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("claim_images")
      .upload(path, image, { contentType: image.type, upsert: false });

    if (uploadError) {
      console.error("Error uploading proof image:", uploadError);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("claim_images").getPublicUrl(uploadData.path);

    proofUrls.push(publicUrl);
    await notify(
      item.posted_by.id,
      "New claim on your item: " + item.name,
      'Hi, someone has submitted a claim on your lost item "' +
        item.name +
        '."',
    );
  }

  const { error: claimError } = await supabase.from("claims").insert({
    claimant: user.id,
    claimed_item: itemId,
    extra_descriptions: extraDescriptions,
    proof_of_ownerships: proofUrls,
  });

  if (claimError) {
    return new Response(JSON.stringify({ error: claimError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "Claim submitted successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
