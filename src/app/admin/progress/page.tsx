import { supabaseAdmin } from "@/lib/supabase-server";
import { formatCents } from "@/lib/pricing";

export const dynamic = "force-dynamic";

interface Lead {
  id: string;
  email: string | null;
  address: string | null;
  quiz_result: string | null;
  variant: string | null;
  source_tool: string | null;
  source_domain: string | null;
  year_built: number | null;
  unit_count: number | null;
  estimated_total_cents: number | null;
  created_at: string;
}

interface Application {
  id: string;
  property_address: string;
  owner_email: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
  unit_count: number;
  total_cents: number;
  status: string;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_at: string;
}

export default async function ProgressPage() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [leadsRes, recentLeadsRes, appsRes, recentAppsRes] = await Promise.all([
    supabaseAdmin
      .from("landing_page_leads")
      .select("id, variant, source_tool, source_domain, created_at")
      .gte("created_at", sevenDaysAgo),
    supabaseAdmin
      .from("landing_page_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("rental_license_applications")
      .select("id, status, total_cents, paid_at, created_at")
      .gte("created_at", sevenDaysAgo),
    supabaseAdmin
      .from("rental_license_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const allLeads = (leadsRes.data || []) as Array<Pick<Lead, "variant" | "source_tool" | "source_domain" | "created_at">>;
  const recentLeads = (recentLeadsRes.data || []) as Lead[];
  const allApps = (appsRes.data || []) as Array<Pick<Application, "status" | "total_cents" | "paid_at" | "created_at">>;
  const recentApps = (recentAppsRes.data || []) as Application[];

  // 7-day funnel
  const leadsCount = allLeads.length;
  const paidCount = allApps.filter((a) => a.status === "paid" || a.status === "intake_complete" || a.status === "awaiting_phtin").length;
  const completedCount = allApps.filter((a) => a.status === "completed").length;
  const totalRevenueCents = allApps
    .filter((a) => a.paid_at)
    .reduce((sum, a) => sum + (a.total_cents || 0), 0);

  // Variant breakdown
  const variantCounts: Record<string, number> = { control: 0, v1: 0, v2: 0 };
  allLeads.forEach((l) => {
    const v = l.variant || "unknown";
    variantCounts[v] = (variantCounts[v] || 0) + 1;
  });

  // Tool breakdown
  const toolCounts: Record<string, number> = {};
  allLeads.forEach((l) => {
    const t = l.source_tool || "unknown";
    toolCounts[t] = (toolCounts[t] || 0) + 1;
  });

  // Application status breakdown
  const statusCounts: Record<string, number> = {};
  recentApps.forEach((a) => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#333543" }}>
          Landing progress
        </h1>
        <p className="text-sm mt-1" style={{ color: "#6b6d7b" }}>
          Last 7 days. Updates on every reload.
        </p>
      </div>

      {/* Headline stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Leads captured (7d)" value={String(leadsCount)} accent="#50b8a2" />
        <StatCard label="Applications paid (7d)" value={String(paidCount)} accent="#6750a1" />
        <StatCard label="Licenses completed (7d)" value={String(completedCount)} accent="#22c55e" />
        <StatCard label="Revenue (7d)" value={formatCents(totalRevenueCents)} accent="#f59e0b" />
      </div>

      {/* Variant performance */}
      <Panel title="A/B variant split (7d leads)">
        <div className="grid grid-cols-3 gap-4">
          {(["control", "v1", "v2"] as const).map((v) => (
            <div key={v} className="rounded-xl border p-4" style={{ borderColor: "#e2e3e7" }}>
              <div className="text-xs uppercase tracking-widest" style={{ color: "#6b6d7b" }}>
                {v}
              </div>
              <div className="text-2xl font-extrabold mt-1" style={{ color: "#333543" }}>
                {variantCounts[v] || 0}
              </div>
              <div className="text-[11px] mt-1" style={{ color: "#b0b2bc" }}>
                {leadsCount > 0 ? `${Math.round(((variantCounts[v] || 0) / leadsCount) * 100)}%` : "—"} of leads
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Tool usage breakdown */}
      <Panel title="Leads by source tool (7d)">
        {Object.keys(toolCounts).length === 0 ? (
          <p className="text-sm" style={{ color: "#6b6d7b" }}>No leads yet.</p>
        ) : (
          <div className="space-y-1.5">
            {Object.entries(toolCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([tool, count]) => (
                <Row key={tool} label={tool.replace(/_/g, " ")} value={String(count)} />
              ))}
          </div>
        )}
      </Panel>

      {/* Application status breakdown */}
      <Panel title="Application pipeline (latest 20)">
        {Object.keys(statusCounts).length === 0 ? (
          <p className="text-sm" style={{ color: "#6b6d7b" }}>No applications yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="rounded-xl border p-3" style={{ borderColor: "#e2e3e7" }}>
                <div className="text-[11px] uppercase tracking-widest" style={{ color: "#6b6d7b" }}>
                  {status.replace(/_/g, " ")}
                </div>
                <div className="text-xl font-bold mt-1" style={{ color: "#333543" }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Recent applications */}
      <Panel title="Recent applications (latest 20)">
        {recentApps.length === 0 ? (
          <p className="text-sm" style={{ color: "#6b6d7b" }}>
            No applications yet. Once a user pays, they&apos;ll show up here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest" style={{ color: "#6b6d7b" }}>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Property</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4">Units</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((a) => (
                  <tr key={a.id} className="border-t" style={{ borderColor: "#f0efec" }}>
                    <td className="py-2 pr-4 text-[11px]" style={{ color: "#6b6d7b" }}>
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {a.property_address}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {[a.owner_first_name, a.owner_last_name].filter(Boolean).join(" ") || a.owner_email || "—"}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {a.unit_count}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {formatCents(a.total_cents)}
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Recent leads */}
      <Panel title="Recent leads (latest 20)">
        {recentLeads.length === 0 ? (
          <p className="text-sm" style={{ color: "#6b6d7b" }}>
            No leads yet. The AddressTool writes here as users run lookups.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest" style={{ color: "#6b6d7b" }}>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Address</th>
                  <th className="py-2 pr-4">Source</th>
                  <th className="py-2 pr-4">Variant</th>
                  <th className="py-2 pr-4">Est. total</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((l) => (
                  <tr key={l.id} className="border-t" style={{ borderColor: "#f0efec" }}>
                    <td className="py-2 pr-4 text-[11px]" style={{ color: "#6b6d7b" }}>
                      {new Date(l.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {l.email || "—"}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {l.address || "—"}
                    </td>
                    <td className="py-2 pr-4 text-[11px]" style={{ color: "#6b6d7b" }}>
                      {(l.source_tool || "—").replace(/_/g, " ")}
                    </td>
                    <td className="py-2 pr-4 text-[11px]" style={{ color: "#6b6d7b" }}>
                      {l.variant || "—"}
                    </td>
                    <td className="py-2 pr-4" style={{ color: "#333543" }}>
                      {l.estimated_total_cents ? formatCents(l.estimated_total_cents) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border p-5 bg-white" style={{ borderColor: "#e2e3e7" }}>
      <div className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "#6b6d7b" }}>
        {label}
      </div>
      <div className="text-3xl font-extrabold mt-2" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "#e2e3e7" }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "#333543" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: "#333543" }}>{label}</span>
      <span className="font-semibold" style={{ color: "#333543" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const palette: Record<string, { bg: string; fg: string }> = {
    pending_payment: { bg: "#f8f8fa", fg: "#6b6d7b" },
    paid: { bg: "#dbeafe", fg: "#1d4ed8" },
    intake_complete: { bg: "#dcfce7", fg: "#166534" },
    awaiting_phtin: { bg: "#fef3c7", fg: "#92400e" },
    blocked: { bg: "#fecaca", fg: "#991b1b" },
    completed: { bg: "#50b8a2", fg: "#ffffff" },
  };
  const c = palette[status] || { bg: "#f8f8fa", fg: "#6b6d7b" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
