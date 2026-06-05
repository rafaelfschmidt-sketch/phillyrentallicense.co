// Vercel Cron weekly ping to keep the Supabase project from auto-pausing
// after 7 days of inactivity (free tier). Hits Supabase's REST API directly
// so this route doesn't depend on any specific supabase-js client setup
// already in the repo — just needs the env vars to be present.

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return Response.json(
      { ok: false, reason: "missing-supabase-env" },
      { status: 500 },
    );
  }

  // Any read counts as activity. We hit the REST root which returns the
  // OpenAPI definition — cheapest possible touch on the database.
  const resp = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  return Response.json({
    ok: resp.ok,
    status: resp.status,
    touched_at: new Date().toISOString(),
  });
}
