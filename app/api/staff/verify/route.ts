import { NextResponse } from "next/server";

/**
 * POST /auth/verify
 * Body: { code: string }
 * Public endpoint — no auth required.
 * Validates whether the provided staff signup code is correct.
 * Used client-side before account creation to fail fast.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim();

  if (!code) {
    return NextResponse.json(
      { error: "Staff code is required" },
      { status: 400 },
    );
  }

  const validCode = process.env.STAFF_SIGNUP_CODE;
  if (!validCode || code !== validCode) {
    return NextResponse.json({ error: "Invalid staff code" }, { status: 403 });
  }

  return NextResponse.json({ valid: true });
}
