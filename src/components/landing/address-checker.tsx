"use client";

import { useState } from "react";
import { Animate } from "./animate";
import { AddressAutocomplete } from "./address-autocomplete";
import { createClient } from "@/lib/supabase-browser";

interface ComplianceResult {
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

export function AddressChecker() {
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

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

  async function handleCheck() {
    if (!email.trim() || !address.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const cleanAddress = normalizeInput(address);

    if (!emailSubmitted) {
      try {
        const supabase = createClient();
        await supabase.from("landing_page_leads").insert({
          email: email.trim(),
          address: cleanAddress,
        });
      } catch {
        // Non-blocking
      }
      setEmailSubmitted(true);
    }

    try {
      const res = await fetch(
        `/api/philly?address=${encodeURIComponent(cleanAddress)}`
      );
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "UPSTREAM_UNAVAILABLE") {
          setError(
            "Philadelphia's city data is temporarily down. This is a city-side hiccup — please try again in a minute."
          );
        } else {
          setError(
            "Something went wrong on our side. Please try again or email license@hubkey.co."
          );
        }
        return;
      }
      // 200 OK but no property data means the address didn't match OPA
      if (!data?.opaData) {
        setError(
          `We couldn't find "${cleanAddress}" in Philadelphia's property records. Try the format: 1234 N BROAD ST (no commas, no zip code).`
        );
        return;
      }
      setResult(data);
    } catch {
      setError(
        "Could not reach Philadelphia's city data. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const yearBuilt = result?.opaData?.year_built;
  const needsLeadPaint = yearBuilt != null && yearBuilt > 0 && yearBuilt <= 1978;

  return (
    <section id="address-checker" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Free compliance preview
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Check your <span className="highlight-word">property</span>
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-12" style={{ color: "#6b6d7b" }}>
            See what the city has on file — no commitment, no cost.
          </p>
        </Animate>

        <Animate delay={300}>
          <div className="rounded-2xl border p-6 md:p-8 bg-white" style={{ borderColor: "#e8e7e4" }}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "#333543" }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#50b8a2]"
                  style={{ borderColor: "#e2e3e7", color: "#333543" }}
                />
                <p className="text-xs mt-1" style={{ color: "#b0b2bc" }}>
                  We&apos;ll send your results here — no spam, ever.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: "#333543" }}>
                  Property address
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <AddressAutocomplete
                      value={address}
                      onChange={setAddress}
                      onSubmit={handleCheck}
                      placeholder="Start typing… we'll suggest Philly addresses"
                      accentColor="#50b8a2"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#50b8a2]"
                      style={{ borderColor: "#e2e3e7", color: "#333543" }}
                    />
                  </div>
                  <button
                    onClick={handleCheck}
                    disabled={loading || !email.trim() || !address.trim()}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    style={{ backgroundColor: "#50b8a2" }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Checking
                      </span>
                    ) : (
                      "Check"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl p-4 text-sm" style={{ backgroundColor: "#fef8f8", color: "#dc2626" }}>
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6 pt-6 border-t space-y-5" style={{ borderColor: "#f0efec" }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#333543" }}>
                  <div className="w-2 h-2 rounded-full bg-[#50b8a2]" />
                  Results for {result.address}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ResultCard
                    label="Year Built"
                    value={yearBuilt ? String(yearBuilt) : "Not found"}
                    status={yearBuilt ? (needsLeadPaint ? "warning" : "good") : "neutral"}
                    detail={needsLeadPaint ? "Lead paint test required" : yearBuilt ? "No lead test needed" : undefined}
                  />
                  <ResultCard
                    label="Rental License"
                    value={result.rentalLicense?.hasActiveLicense ? "Active" : "Not found"}
                    status={result.rentalLicense?.hasActiveLicense ? "good" : "bad"}
                  />
                  <ResultCard
                    label="Open Violations"
                    value={result.violations?.hasOpenViolations ? `${result.violations.open.length}` : "None"}
                    status={result.violations?.hasOpenViolations ? "bad" : "good"}
                  />
                  <ResultCard
                    label="Lead Cert"
                    value={!needsLeadPaint ? "Not required" : result.leadCertification?.hasCert ? (result.leadCertification.expired ? "Expired" : "Valid") : "Missing"}
                    status={!needsLeadPaint ? "good" : result.leadCertification?.hasCert && !result.leadCertification.expired ? "good" : "bad"}
                  />
                </div>

                {result.readinessScore != null && (
                  <div className="rounded-xl p-4" style={{ backgroundColor: "#f7f6f3" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium" style={{ color: "#6b6d7b" }}>License Readiness</span>
                      <span className="text-sm font-bold" style={{ color: "#50b8a2" }}>{result.readinessScore}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e3e7" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${result.readinessScore}%`,
                          backgroundColor: result.readinessScore >= 80 ? "#50b8a2" : result.readinessScore >= 50 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-center pt-2">
                  <p className="text-base font-semibold mb-4" style={{ color: "#333543" }}>
                    Want us to handle this for you?
                  </p>
                  <button
                    onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                    style={{ backgroundColor: "#50b8a2" }}
                  >
                    Get Started — $500
                  </button>
                </div>
              </div>
            )}
          </div>
        </Animate>
      </div>
    </section>
  );
}

function ResultCard({ label, value, status, detail }: {
  label: string; value: string; status: "good" | "bad" | "warning" | "neutral"; detail?: string;
}) {
  const colors = {
    good: { bg: "#f0fdf4", border: "#dcfce7", dot: "#22c55e" },
    bad: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444" },
    warning: { bg: "#fffbeb", border: "#fef3c7", dot: "#f59e0b" },
    neutral: { bg: "#f8f8fa", border: "#e2e3e7", dot: "#6b6d7b" },
  };
  const c = colors[status];

  return (
    <div className="rounded-xl border p-3.5" style={{ backgroundColor: c.bg, borderColor: c.border }}>
      <div className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "#6b6d7b" }}>{label}</div>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.dot }} />
        <span className="text-sm font-bold" style={{ color: "#333543" }}>{value}</span>
      </div>
      {detail && <p className="text-[10px] mt-0.5" style={{ color: "#6b6d7b" }}>{detail}</p>}
    </div>
  );
}
