"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/landing/address-autocomplete";
import {
  calculatePrice,
  formatCents,
  type UnitInput,
} from "@/lib/pricing";

export default function IntakePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
      <CheckoutForm />
    </Suspense>
  );
}

function CheckoutForm() {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || "license_only";

  const [address, setAddress] = useState("");
  const [unitCount, setUnitCount] = useState("1");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  // Per-unit bedroom selection
  const [unitBeds, setUnitBeds] = useState<Record<number, string>>({});

  // City data lookup
  const [cityLoading, setCityLoading] = useState(false);
  const [yearBuilt, setYearBuilt] = useState<number | null>(null);
  const [leadRequired, setLeadRequired] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const lastLookedUp = useRef("");

  const runLookup = useCallback(async (addr: string) => {
    if (!addr || addr.length < 5) return;
    if (addr === lastLookedUp.current) return;
    lastLookedUp.current = addr;
    setCityLoading(true);
    try {
      const resp = await fetch(`/api/philly?address=${encodeURIComponent(addr)}`);
      if (!resp.ok) throw new Error("Lookup failed");
      const data = await resp.json();
      const yb = data.opaData?.year_built ? parseInt(String(data.opaData.year_built)) : null;
      setYearBuilt(yb);
      setLeadRequired(yb ? yb <= 1978 : false);
      setLookupDone(true);
    } catch {
      setLookupDone(true);
    } finally {
      setCityLoading(false);
    }
  }, []);

  // Debounced auto-lookup
  useEffect(() => {
    if (!address || address.length < 5) return;
    if (address === lastLookedUp.current) return;
    const timer = setTimeout(() => runLookup(address), 800);
    return () => clearTimeout(timer);
  }, [address, runLookup]);

  // Build units array for pricing
  const count = Math.max(1, parseInt(unitCount) || 1);
  const units: UnitInput[] = Array.from({ length: count }, (_, i) => ({
    label: count > 1 ? `Unit ${i + 1}` : "Entire Property",
    bedroomCount: parseInt(unitBeds[i] || "1"),
  }));

  const pricing = calculatePrice(units, leadRequired, serviceParam);

  const canCheckout = address.length >= 5 && email.includes("@") && lookupDone;

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError("");
    try {
      // Create minimal application record
      const intakeResp = await fetch("/api/rental-license/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: serviceParam,
          propertyAddress: address.trim().toUpperCase(),
          unitCount: count,
          yearBuilt,
          leadPaintRequired: leadRequired,
          ownerEmail: email.trim(),
          ownerFirstName: "",
          ownerLastName: "",
          unitDetails: units,
          forceStatus: "pending_payment",
        }),
      });
      const intakeData = await intakeResp.json();
      if (!intakeResp.ok) throw new Error(intakeData.error);

      // Create Stripe checkout session
      const stripeResp = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: intakeData.applicationId }),
      });
      const stripeData = await stripeResp.json();
      if (!stripeResp.ok) throw new Error(stripeData.error);

      window.location.href = stripeData.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}
        >
          Get Your Rental License
        </h1>
        <p style={{ color: "#6b6d7b" }} className="text-sm">
          Enter your property details and we&apos;ll calculate your total.
        </p>
      </div>

      {/* Property address */}
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium" style={{ color: "#333543" }}>
            Rental Property Address
          </label>
          <div className="mt-1">
            <AddressAutocomplete
              value={address}
              onChange={(v) => {
                setAddress(v);
                // If user picked a full suggestion, trigger the compliance + pricing lookup.
                if (v && v !== address && /\d/.test(v)) {
                  runLookup(v);
                }
              }}
              onSubmit={() => runLookup(address)}
              placeholder="Start typing your Philly address…"
              accentColor="#50b8a2"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          {cityLoading && (
            <p className="text-xs mt-1" style={{ color: "#6b6d7b" }}>
              Looking up property data...
            </p>
          )}
          {lookupDone && yearBuilt && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#50b8a2]/10 text-[#50b8a2] font-medium">
                Built {yearBuilt}
              </span>
              {leadRequired && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                  Lead paint testing required
                </span>
              )}
            </div>
          )}
        </div>

        {/* Units */}
        <div>
          <label className="text-sm font-medium" style={{ color: "#333543" }}>
            How many units?
          </label>
          <Input
            type="number"
            min="1"
            max="20"
            value={unitCount}
            onChange={(e) => setUnitCount(e.target.value)}
            className="mt-1 w-24"
          />
        </div>

        {/* Bedrooms per unit */}
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>
            <label className="text-sm font-medium" style={{ color: "#333543" }}>
              {count > 1 ? `Unit ${i + 1} — Bedrooms` : "Bedrooms"}
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {[
                { label: "Studio", value: "0" },
                { label: "1", value: "1" },
                { label: "2", value: "2" },
                { label: "3", value: "3" },
                { label: "4", value: "4" },
                { label: "5+", value: "5" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    (unitBeds[i] || "") === opt.value
                      ? "bg-[#50b8a2] text-white border-[#50b8a2]"
                      : "bg-white border-gray-300 hover:border-gray-400"
                  }`}
                  style={{ color: (unitBeds[i] || "") === opt.value ? undefined : "#333543" }}
                  onClick={() => setUnitBeds((prev) => ({ ...prev, [i]: opt.value }))}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Email */}
        <div>
          <label className="text-sm font-medium" style={{ color: "#333543" }}>
            Email Address
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1"
          />
          <p className="text-xs mt-1" style={{ color: "#b0b2bc" }}>
            We&apos;ll send your receipt and application updates here.
          </p>
        </div>
      </div>

      {/* Price breakdown */}
      {lookupDone && (
        <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: "#e8e7e4", backgroundColor: "#fafaf9" }}>
          <div className="flex justify-between text-sm" style={{ color: "#333543" }}>
            <span>Service Fee</span>
            <span className="font-medium">{formatCents(pricing.serviceFee)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: "#333543" }}>
            <span>City License Fee ({count} unit{count > 1 ? "s" : ""} x $69)</span>
            <span className="font-medium">{formatCents(pricing.licenseFee)}</span>
          </div>
          {pricing.leadPaintRequired && (
            <>
              <div className="border-t" style={{ borderColor: "#e8e7e4" }} />
              <p className="text-xs font-medium" style={{ color: "#6b6d7b" }}>
                Lead Paint Testing (pre-1978 property)
              </p>
              {pricing.leadPaintPerUnit.map((u, i) => (
                <div key={i} className="flex justify-between text-sm pl-3" style={{ color: "#333543" }}>
                  <span>{u.label} ({u.bedroomCount === 0 ? "Studio" : `${u.bedroomCount} BR`})</span>
                  <span className="font-medium">{formatCents(u.fee)}</span>
                </div>
              ))}
            </>
          )}
          <div className="border-t pt-3" style={{ borderColor: "#e8e7e4" }}>
            <div className="flex justify-between text-base font-bold" style={{ color: "#333543" }}>
              <span>Total</span>
              <span>{formatCents(pricing.total)}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Pay button */}
      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={!canCheckout || checkingOut}
          className="w-full text-center px-6 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
          style={{ backgroundColor: "#50b8a2" }}
        >
          {checkingOut
            ? "Redirecting to payment..."
            : lookupDone
              ? `Pay ${formatCents(pricing.total)} & Get Started`
              : "Enter your address to see pricing"
          }
        </button>
        <p className="text-center text-xs" style={{ color: "#b0b2bc" }}>
          Secure payment via Stripe. By proceeding, you agree to the{" "}
          <a href="/legal/rental-license-agreement" target="_blank" className="underline">
            Service Agreement
          </a>.
        </p>
      </div>

      {/* Back to landing */}
      <div className="text-center">
        <a
          href="/apply/rental-license"
          className="text-sm font-medium transition-colors hover:opacity-70"
          style={{ color: "#6b6d7b" }}
        >
          &larr; Back to pricing
        </a>
      </div>
    </div>
  );
}
