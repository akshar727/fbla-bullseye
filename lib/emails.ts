import "server-only";
import { createClient } from "@/lib/supabase/server";
import { UserResponse } from "./types";
import nodemailer from "nodemailer";

import { createClient as superCreateClient } from "@supabase/supabase-js";

export const supabaseAdmin = superCreateClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function notify(userId: string,header: string, message: string) {

  const { data, error }: { data: UserResponse | null; error: any } =
    await supabaseAdmin.from("users").select("*").eq("id", userId).single();
  if (error) return undefined;

  await supabaseAdmin.from("notifications").insert({
    header: header,
    message: message,
    notified_user: userId,
  });
  if (data?.send_email_notifs) {
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
        text: message,
      });
      console.log("Email notification sent successfully to  " + data?.email);
    } catch (err) {
      console.error(err);
      // throw new Error("Failed to send email notification");
    }
  }
}
