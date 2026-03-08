import type { ClaimResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { notify } from "@/lib/emails";
import { after } from "next/server";
import ClaimAcceptedEmail from "@/components/email/claim-accepted";
import { render } from "@react-email/components";
import log from "@/lib/dbLogger";
import { createRoom } from "@/lib/chat";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const { claimId } = await params;
  const supabase = await createClient();
  const { data: claim, error }: { data: ClaimResponse | null; error: any } =
    await supabase
      .from("claims")
      .select(
        `
    *,
    claimed_item:items!claim_claimed_item_fkey (
      *,
      posted_by:users!items_posted_by_fkey (
        id,
        name
      ),
      claimed_by:users!items_claimed_by_fkey (
        id,
        name
      )
    )
  `,
      )
      .eq("id", claimId)
      .single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(claim), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { claimId } = await params;
  const { data: claim, error: fetchError } = await supabase
    .from("claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (fetchError || !claim) {
    return new Response(JSON.stringify({ error: "Claim not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (claim.claimant !== user.id) {
    return new Response(
      JSON.stringify({ error: "You do not own this claim" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { error: deleteError } = await supabase
    .from("claims")
    .delete()
    .eq("id", claimId);

  if (deleteError) {
    return new Response(JSON.stringify({ error: deleteError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ message: "Claim deleted successfully" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * PATCH /api/claims/[claimId]
 * Body: { action: "approve" | "deny" }
 * Only the user who posted the item can approve/deny claims on it.
 * Approving marks the item as "claimed" and sets claimed_by.
 * Denying simply deletes the claim record.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ claimId: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { claimId } = await params;
  const { action } = (await request.json()) as { action: "approve" | "deny" };

  // Fetch the claim and its item in one query
  const { data: claim, error: fetchError } = await supabase
    .from("claims")
    .select("*, claimed_item(*), claimant(id, name)")
    .eq("id", claimId)
    .single();

  if (fetchError || !claim) {
    return new Response(JSON.stringify({ error: "Claim not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only the item's original poster can approve/deny
  if (claim.claimed_item.posted_by !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "approve") {
    // Delete all other claims for this item first
    const { error: deleteOtherClaimsError } = await supabase
      .from("claims")
      .delete()
      .eq("claimed_item", claim.claimed_item.id)
      .neq("id", claimId);

    if (deleteOtherClaimsError) {
      return new Response(
        JSON.stringify({ error: deleteOtherClaimsError.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const emailHtml = await render(
      <ClaimAcceptedEmail
        name={claim.claimant.name.split(" ")[0] ?? "User"}
        itemName={claim.claimed_item.name}
      />,
    );
    after(() =>
      Promise.all([
        notify(
          claim.claimant,
          "Your claim was approved for " + claim.claimed_item.name,
          'Your claim on the item "' +
            claim.claimed_item.name +
            '" was approved by the finder.',
          emailHtml,
        ),
        log(
          "Claim approved",
          `${claim.claimed_item.name} claimed by ${claim.claimant.name}`,
        ),
      ]).catch((err) =>
        console.error("Error sending notification email:", err),
      ),
    );
    // Mark the item as claimed
    const { error: itemError } = await supabase
      .from("items")
      .update({ status: "claimed", claimed_by: claim.claimant.id })
      .eq("id", claim.claimed_item.id);

    if (itemError) {
      return new Response(JSON.stringify({ error: itemError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create a chat room between the finder and the claimant
    const { data: finderData } = await supabase
      .from("users")
      .select("id, name")
      .eq("id", user.id)
      .single();
    if (finderData) {
      await createRoom(
        { id: finderData.id, name: finderData.name },
        { id: claim.claimant.id, name: claim.claimant.name },
        { id: claimId },
      ).catch(console.error);
    }

    return new Response(JSON.stringify({ message: "Claim approved" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (action === "deny") {
    const { error: deleteError } = await supabase
      .from("claims")
      .delete()
      .eq("id", claimId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If no claims remain on the item, revert it back to "lost"
    const { count } = await supabase
      .from("claims")
      .select("*", { count: "exact", head: true })
      .eq("claimed_item", claim.claimed_item.id);

    if (count === 0) {
      await supabase
        .from("items")
        .update({ status: "lost" })
        .eq("id", claim.claimed_item.id);
    }

    return new Response(JSON.stringify({ message: "Claim denied" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}
