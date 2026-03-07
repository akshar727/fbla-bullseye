import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const { supabase, errorResponse } = await requireAdmin();
  if (errorResponse) return errorResponse;

  const [
    { count: totalUsers },
    { count: totalItems },
    { count: activeClaims },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase
      .from("claims")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("logs")
      .select("header, message, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return NextResponse.json({
    totalUsers: totalUsers ?? 0,
    totalItems: totalItems ?? 0,
    activeClaims: activeClaims ?? 0,
    spamBlocked: 47,
    recentLogs: recentLogs ?? [],
  });
}
