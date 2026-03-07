import "server-only";
import { UserResponse } from "./types";
import nodemailer from "nodemailer";

import { createClient as superCreateClient } from "@supabase/supabase-js";

export async function notify(
  user: { id: string; name: string },
  header: string,
  message: string,
  emailHtml?: string,
  forceSendEmail = false,
) {
  const supabaseAdmin = await superCreateClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
  console.log("create client; ", user, header, message);
  const { data, error }: { data: UserResponse | null; error: any } =
    await supabaseAdmin.from("users").select("*").eq("id", user.id).single();
  if (error) {
    console.error("Failed to fetch user for notification:", error);
    return;
  }

  await supabaseAdmin.from("notifications").insert({
    header: header,
    message: message,
    notified_user: user.id,
  });
  if (data?.send_email_notifs || forceSendEmail) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: data?.email,
        subject: header,
        html: emailHtml,
      });
      console.log("Email notification sent successfully to  " + data?.email);
    } catch (err) {
      console.error(err);
      // throw new Error("Failed to send email notification");
    }
  }
}
