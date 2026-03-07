import { NextResponse } from "next/server";
import { after } from "next/server";
import { notify } from "@/lib/emails";
import { render } from "@react-email/components";
import WelcomeEmail from "@/components/email/welcome";
import log from "@/lib/dbLogger";

export async function POST(request: Request) {
  // Verify it's really from Supabase
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, email } = body.record;
  const emailHtml = await render(<WelcomeEmail name={name} />);
  after(() =>
    Promise.all([
      notify(
        { id, name },
        "Welcome to Bullseye!",
        `Hi ${name}, your account is ready.`,
        emailHtml,
        true, // Force send welcome email regardless of user settings
      ),
      log("New user registered", email),
    ]).catch(console.error),
  );

  return NextResponse.json({ ok: true });
}
