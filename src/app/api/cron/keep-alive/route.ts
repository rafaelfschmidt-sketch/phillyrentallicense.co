// ============================================================================
// GET /api/cron/keep-alive
// ============================================================================
// Touches Supabase with a cheap read so the project's idle clock resets.
// Without this, free-tier Supabase pauses the project after ~7 days of zero
// traffic; reactivation takes a minute and any cron / form submission in
// that window 500s.
//
// Configured via vercel.json to run daily. Vercel cron requests carry an
// Authorization: Bearer <CRON_SECRET> header — we verify it so the
// endpoint can't be hammered by a random caller.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = req.headers.get("authorization");
    if (provided !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Cheap head-only count against an existing table. We don't care about
  // the value — the point is to roundtrip a query so the connection stays
  // warm and Supabase's idle timer resets.
  const { error } = await supabaseAdmin
    .from("rental_license_applications")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[cron/keep-alive] supabase ping failed", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}
