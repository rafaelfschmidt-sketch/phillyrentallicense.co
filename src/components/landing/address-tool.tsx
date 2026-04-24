"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Animate } from "./animate";
import { AddressAutocomplete } from "./address-autocomplete";
import { createClient } from "@/lib/supabase-browser";
import {
  SERVICE_FEE_CENTS,
  LICENSE_FEE_PER_UNIT_CENTS,
  calculatePrice,
  formatCents,
  type UnitInput,
} from "@/lib/pricing";

interface ComplianceReport {
  address: string;
  opaData?: {
    year_built?: number;
    owner_1?: string;
    parcel_number?: string;
  };
  violations?: {
    open: unknown[];
    total: number;
    hasOpenViolations: boolean;
  };
  rentalLicense?: {
    hasActiveLicense: boolean;
    expirationDate?: string;
  };
  leadCertification?: {
    required: boolean;
    hasCert: boolean;
    expired: boolean;
  };
  readinessScore?: number;
  blockers?: string[];
  warnings?: string[];
}

interface Unit {
  label: string;
  bedrooms: number;
}

function getApplyUrl(pathAndQuery: string): string {
  const base = process.env.NEXT_PUBLIC_APPLY_URL || "";
  if (base) return `${base}${pathAndQuery}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${pathAndQuery}`;
  }
  return pathAndQuery;
}

function normalizeInput(raw: string): string {
  return raw
    .toUpperCase()
    .trim()
    .replace(/,.*$/, "")
    .replace(/\s+(PHILADELPHIA|PHILA|PA|PA\s*\d+).*$/i, "")
    .replace(/\./g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function AddressTool() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [units, setUnits] = useState<Unit[]>([{ label: "Unit 1", bedrooms: 2 }]);
  const [leadPaintOverride, setLeadPaintOverride] = useState<boolean | null>(null);

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleLookup() {
    if (!address.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);

    const cleanAddress = normalizeInput(address);

    try {
      const res = await fetch(
        `/api/philly?address=${encodeURIComponent(cleanAddress)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          data?.code === "UPSTREAM_UNAVAILABLE"
            ? "Philadelphia's city data is temporarily down. Try again in a minute — or continue to checkout and we'll verify during onboarding."
            : "Something went wrong. Try again or email license@hubkey.co."
        );
        return;
      }
      if (!data?.opaData) {
        setError(
          `We couldn't find "${cleanAddress}" in Philadelphia's property records. Try format: 1234 N BROAD ST. You can still continue to checkout.`
        );
        // Still allow user to proceed — show minimal view
        setReport({ address: cleanAddress });
        return;
      }
      setReport(data);

      try {
        const supabase = createClient();
        const variant = typeof document !== "undefined"
          ? document.cookie.split("; ").find((c) => c.startsWith("lp_variant="))?.split("=")[1]
          : undefined;
        const source_domain = typeof document !== "undefined"
          ? document.cookie.split("; ").find((c) => c.startsWith("lp_domain="))?.split("=")[1]
          : undefined;
        await supabase.from("landing_page_leads").insert({
          email: "",
          address: cleanAddress,
          year_built: data?.opaData?.year_built || null,
          variant: variant || "control",
          source_domain: source_domain || "hub",
          source_tool: "address_tool",
        });
      } catch {
        // non-blocking
      }

      try {
        posthog.capture("address_tool_lookup", {
          address: cleanAddress,
          year_built: data?.opaData?.year_built,
          has_open_violations: data?.violations?.hasOpenViolations,
          readiness_score: data?.readinessScore,
        });
      } catch {
        // non-blocking
      }
    } catch {
      setError("Could not reach Philadelphia's city data. Check your connection or continue to checkout anyway.");
    } finally {
      setLoading(false);
    }
  }

  const yearBuilt =
    report?.opaData?.year_built && report.opaData.year_built > 0
      ? report.opaData.year_built
      : null;
  const autoLeadPaint = yearBuilt != null && yearBuilt <= 1978;
  const leadPaintRequired = leadPaintOverride !== null ? leadPaintOverride : autoLeadPaint;

  const unitInputs: UnitInput[] = units.map((u) => ({
    label: u.label,
    bedroomCount: u.bedrooms,
  }));
  const breakdown = calculatePrice(unitInputs, leadPaintRequired);

  function setUnitCount(count: number) {
    const clamped = Math.max(1, Math.min(20, count));
    setUnits((prev) => {
      if (clamped === prev.length) return prev;
      if (clamped > prev.length) {
        const extras = Array.from({ length: clamped - prev.length }, (_, i) => ({
          label: `Unit ${prev.length + i + 1}`,
          bedrooms: 2,
        }));
        return [...prev, ...extras];
      }
      return prev.slice(0, clamped);
    });
  }

  function updateUnitBedrooms(i: number, bedrooms: number) {
    setUnits((prev) =>
      prev.map((u, idx) => (idx === i ? { ...u, bedrooms: Math.max(0, Math.min(5, bedrooms)) } : u))
    );
  }

  async function handleLockIn() {
    const params = new URLSearchParams({
      address: normalizeInput(address),
      units: String(units.length),
      pre1978: leadPaintRequired ? "1" : "0",
    });
    if (yearBuilt) params.set("year_built", String(yearBuilt));
    const checkoutUrl = getApplyUrl(`/apply/rental-license/intake?${params.toString()}`);

    try {
      posthog.capture("address_tool_checkout_click", {
        total_cents: breakdown.total,
        unit_count: units.length,
        lead_paint_required: leadPaintRequired,
      });
    } catch {
      // non-blocking
    }

    window.location.href = checkoutUrl;
  }

  async function handleEmailReport() {
    if (!email.trim() || !report) return;
    try {
      const supabase = createClient();
      const variant = typeof document !== "undefined"
        ? document.cookie.split("; ").find((c) => c.startsWith("lp_variant="))?.split("=")[1]
        : undefined;
      await supabase.from("landing_page_leads").insert({
        email: email.trim(),
        address: normalizeInput(address),
        year_built: yearBuilt,
        unit_count: units.length,
        estimated_total_cents: breakdown.total,
        variant: variant || "control",
        source_domain: "hub",
        source_tool: "address_tool_email",
      });
      setEmailSent(true);
      try {
        posthog.capture("address_tool_email_capture", { address: normalizeInput(address) });
      } catch { /* non-blocking */ }
    } catch {
      // non-blocking; show sent anyway
      setEmailSent(true);
    }
  }

  const needsLeadPaint = yearBuilt != null && yearBuilt > 0 && yearBuilt <= 1978;

  return (
    <section id="address-tool" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#50b8a2" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Your property · Your price
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}
          >
            Check your <span className="highlight-word">property</span>. See your price.
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-10" style={{ color: "#6b6d7b" }}>
            One address. We pull from Philadelphia&apos;s city records and show what&apos;s on file,
            what&apos;s required, and exactly what you&apos;ll pay. No email gate.
          </p>
        </Animate>

        <Animate delay={300}>
          <div className="rounded-2xl border p-6 md:p-8 bg-white" style={{ borderColor: "#e8e7e4" }}>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: "#333543" }}>
                Property address
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <AddressAutocomplete
                    value={address}
                    onChange={setAddress}
                    onSubmit={handleLookup}
                    placeholder="Start typing your Philly address…"
                    accentColor="#50b8a2"
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#50b8a2]"
                    style={{ borderColor: "#e2e3e7", color: "#333543" }}
                  />
                </div>
                <button
                  onClick={handleLookup}
                  disabled={loading || !address.trim()}
                  className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  style={{ backgroundColor: "#50b8a2" }}
                >
                  {loading ? "Checking…" : "Check & price"}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: "#b0b2bc" }}>
                Philadelphia addresses only. We pull from the Office of Property Assessment.
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-xl p-4 text-sm" style={{ backgroundColor: "#fef8f8", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {report && (
              <div className="mt-6 pt-6 border-t space-y-8" style={{ borderColor: "#f0efec" }}>
                {/* Property summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FactCard
                    label="Year Built"
                    value={yearBuilt ? String(yearBuilt) : "Unknown"}
                    detail={yearBuilt == null ? "Not in OPA records" : autoLeadPaint ? "Pre-1978 — lead test needed" : "Post-1978 — no lead test"}
                    tone={yearBuilt == null ? "neutral" : autoLeadPaint ? "warning" : "good"}
                  />
                  <FactCard
                    label="Rental License"
                    value={report.rentalLicense?.hasActiveLicense ? "Active" : "Not found"}
                    tone={report.rentalLicense?.hasActiveLicense ? "good" : "bad"}
                  />
                  <FactCard
                    label="Open Violations"
                    value={
                      report.violations?.hasOpenViolations
                        ? `${report.violations.open.length}`
                        : "None"
                    }
                    tone={report.violations?.hasOpenViolations ? "bad" : "good"}
                  />
                </div>

                {report.readinessScore != null && (
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#f7f6f3" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: "#6b6d7b" }}>
                        License Readiness
                      </span>
                      <span className="text-sm font-bold" style={{ color: "#50b8a2" }}>
                        {report.readinessScore}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e3e7" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${report.readinessScore}%`,
                          backgroundColor:
                            report.readinessScore >= 80
                              ? "#50b8a2"
                              : report.readinessScore >= 50
                              ? "#f59e0b"
                              : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Units + lead paint config */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium" style={{ color: "#333543" }}>
                      How many units?
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setUnitCount(units.length - 1)}
                        disabled={units.length <= 1}
                        className="w-8 h-8 rounded-lg border text-sm font-semibold disabled:opacity-40"
                        style={{ borderColor: "#e2e3e7", color: "#333543" }}
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-base font-bold" style={{ color: "#333543" }}>
                        {units.length}
                      </span>
                      <button
                        onClick={() => setUnitCount(units.length + 1)}
                        className="w-8 h-8 rounded-lg border text-sm font-semibold"
                        style={{ borderColor: "#e2e3e7", color: "#333543" }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {leadPaintRequired && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium" style={{ color: "#6b6d7b" }}>
                        Bedrooms per unit (affects lead paint pricing)
                      </p>
                      {units.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-xl border px-4 py-2.5"
                          style={{ borderColor: "#e2e3e7" }}
                        >
                          <span className="text-sm font-medium" style={{ color: "#333543" }}>
                            {u.label}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateUnitBedrooms(i, u.bedrooms - 1)}
                              disabled={u.bedrooms <= 0}
                              className="w-7 h-7 rounded border text-xs font-semibold disabled:opacity-40"
                              style={{ borderColor: "#e2e3e7", color: "#333543" }}
                            >
                              −
                            </button>
                            <span className="w-16 text-center text-xs" style={{ color: "#333543" }}>
                              {u.bedrooms === 0 ? "Studio" : `${u.bedrooms} BR`}
                            </span>
                            <button
                              onClick={() => updateUnitBedrooms(i, u.bedrooms + 1)}
                              disabled={u.bedrooms >= 5}
                              className="w-7 h-7 rounded border text-xs font-semibold disabled:opacity-40"
                              style={{ borderColor: "#e2e3e7", color: "#333543" }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: "#f7f6f3" }}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#333543" }}>
                          Lead paint test
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#6b6d7b" }}>
                          {autoLeadPaint
                            ? "Required based on year built (pre-1978)"
                            : "Not required based on year built"}
                        </p>
                      </div>
                      <button
                        onClick={() => setLeadPaintOverride(!leadPaintRequired)}
                        className="text-xs underline shrink-0"
                        style={{ color: "#50b8a2" }}
                      >
                        {leadPaintRequired ? "I have a recent cert" : "Add anyway"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="rounded-xl p-5" style={{ backgroundColor: "#333543" }}>
                  <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "#b0b2bc" }}>
                    Your price
                  </p>
                  <LineItem
                    label="HubKey service fee (flat)"
                    value={formatCents(SERVICE_FEE_CENTS)}
                    sub="Compliance, PHTIN support, L&I submission"
                  />
                  <LineItem
                    label={`City license fee (${units.length} unit${units.length > 1 ? "s" : ""} × ${formatCents(LICENSE_FEE_PER_UNIT_CENTS)})`}
                    value={formatCents(breakdown.licenseFee)}
                    sub="Paid directly to Philadelphia L&I"
                  />
                  {leadPaintRequired && (
                    <LineItem
                      label="Lead paint testing"
                      value={formatCents(breakdown.leadPaintFee)}
                      sub={`Certified inspector, ${units.length} unit${units.length > 1 ? "s" : ""}`}
                    />
                  )}
                  <div className="h-px my-3" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">Total</span>
                    <span className="text-2xl font-extrabold" style={{ color: "#50b8a2" }}>
                      {formatCents(breakdown.total)}
                    </span>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="text-center pt-1">
                  <button
                    onClick={handleLockIn}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: "#50b8a2" }}
                  >
                    Lock in this price & start my application
                  </button>
                  <p className="text-xs mt-3" style={{ color: "#6b6d7b" }}>
                    You&apos;ll review and confirm before paying. No charge until checkout.
                  </p>
                </div>

                {/* Soft email capture — optional */}
                {!emailSent && (
                  <div className="pt-4 border-t" style={{ borderColor: "#f0efec" }}>
                    <p className="text-xs mb-2" style={{ color: "#6b6d7b" }}>
                      Not ready to buy? We&apos;ll email you this report so you can come back to it.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none"
                        style={{ borderColor: "#e2e3e7", color: "#333543" }}
                      />
                      <button
                        onClick={handleEmailReport}
                        disabled={!email.trim()}
                        className="px-4 py-2 rounded-lg text-xs font-semibold border disabled:opacity-40"
                        style={{ borderColor: "#50b8a2", color: "#50b8a2" }}
                      >
                        Email me this report
                      </button>
                    </div>
                  </div>
                )}
                {emailSent && (
                  <div className="pt-4 border-t text-xs" style={{ borderColor: "#f0efec", color: "#50b8a2" }}>
                    ✓ Report sent. Check your inbox — you can come back to checkout anytime.
                  </div>
                )}
              </div>
            )}
          </div>
        </Animate>
      </div>
    </section>
  );
}

function FactCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone: "good" | "bad" | "warning" | "neutral";
}) {
  const colors = {
    good: { bg: "#f0fdf4", border: "#dcfce7", dot: "#22c55e" },
    bad: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
    warning: { bg: "#fffbeb", border: "#fef3c7", dot: "#f59e0b" },
    neutral: { bg: "#f8f8fa", border: "#e2e3e7", dot: "#6b6d7b" },
  };
  const c = colors[tone];
  return (
    <div className="rounded-xl border p-3.5" style={{ backgroundColor: c.bg, borderColor: c.border }}>
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "#6b6d7b" }}>
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
        <span className="text-sm font-bold" style={{ color: "#333543" }}>
          {value}
        </span>
      </div>
      {detail && (
        <p className="text-[10px] mt-0.5" style={{ color: "#6b6d7b" }}>
          {detail}
        </p>
      )}
    </div>
  );
}

function LineItem({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div className="flex-1">
        <p className="text-sm text-white">{label}</p>
        {sub && (
          <p className="text-[11px] mt-0.5" style={{ color: "#b0b2bc" }}>
            {sub}
          </p>
        )}
      </div>
      <span className="text-sm font-semibold text-white shrink-0">{value}</span>
    </div>
  );
}
