import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/chat/[roomId]
 * Returns room metadata + message history. Only participants may access.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const supabase = await createClient();
  // get the room id from the get parameters
  const { roomId } = await params;
  // fetch user information from Supabase
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // fetch the room information given the room id
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      `
      id, proposed_time, time_accepted, created_at,time_accepted,
      user1:users!rooms_user1_fkey (id, name),
      user2:users!rooms_user2_fkey (id, name),
      claim:claims!rooms_claim_fkey (
        id,
        claimed_item:items!claim_claimed_item_fkey (id, name)
      )
    `,
    )
    .eq("id", roomId)
    .single();
  // Error handling
  if (roomError || !room) {
    console.log(roomError);
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  // Get the two users and check whether the currently authenticated user
  const u1 = room.user1 as any;
  const u2 = room.user2 as any;
  if (u1.id !== user.id && u2.id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // get the messages of the room
  const { data: messages, error: msgError } = await supabase
    .from("messages")
    .select(
      "id, content, created_at, sender:users!messages_sender_fkey (id, name)",
    )
    .eq("room", roomId)
    .order("created_at", { ascending: true });

  if (msgError) {
    return NextResponse.json({ error: msgError.message }, { status: 500 });
  }
  // return the room and messages associated with it
  return NextResponse.json({ room, messages });
}

/**
 * POST /api/chat/[roomId]
 * Body: { content: string }
 * Sends a message in the room. Only participants may send.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const supabase = await createClient();
  // get the room id from get parameters
  const { roomId } = await params;
  // get the user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  // get the message data
  const body = await request.json();
  const content = String(body?.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Verify participant
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("user1, user2")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  // check if the user is one of the two users in the room
  if (room.user1 !== user.id && room.user2 !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // add the new message to the database
  const { data: message, error: insertError } = await supabase
    .from("messages")
    .insert({ room: roomId, sender: user.id, content })
    .select(
      "id, content, created_at, sender:users!messages_sender_fkey (id, name)",
    )
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(message);
}

/**
 * PATCH /api/chat/[roomId]
 * Body: { proposed_time: string (ISO) }
 * Updates the proposed meetup time. Only participants may update.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const supabase = await createClient();
  const { roomId } = await params;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { proposed_time } = body ?? {};
  if (!proposed_time) {
    return NextResponse.json(
      { error: "proposed_time is required" },
      { status: 400 },
    );
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("user1, user2")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.user1 !== user.id && room.user2 !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from("rooms")
    .update({ proposed_time, time_accepted: false })
    .eq("id", roomId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, proposed_time });
}
