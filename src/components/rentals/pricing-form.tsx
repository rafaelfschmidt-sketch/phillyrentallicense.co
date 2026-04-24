"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  calculatePrice,
  formatCents,
  type UnitInput,
  type PriceBreakdown,
} from "@/lib/pricing";

interface PricingFormProps {
  onApplicationCreated: (applicationId: string) => void;
}

type BedroomOption = 0 | 1 | 2 | 3 | 4 | 5;

const BEDROOM_LABELS: Record<BedroomOption, string> = {
  0: "Studio",
  1: "1 BR",
  2: "2 BR",
  3: "3 BR",
  4: "4 BR",
  5: "5 BR",
};

export function RentalLicensePricingForm({ onApplicationCreated }: PricingFormProps) {
  const [propertyAddress, setPropertyAddress] = useState("");
  const [unitCount, setUnitCount] = useState<number>(1);
  const [units, setUnits] = useState<{ label: string; bedroomCount: BedroomOption }[]>([
    { label: "Entire Property", bedroomCount: 1 },
  ]);
  const [yearBuilt, setYearBuilt] = useState<number | null>(null);
  const [leadPaintRequired, setLeadPaintRequired] = useState(false);
  const [lookupDone, setLookupDone] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Update unit count and adjust units array
  function handleUnitCountChange(count: number) {
    if (count < 1) count = 1;
    if (count > 20) count = 20;
    setUnitCount(count);

    const newUnits: { label: string; bedroomCount: BedroomOption }[] = [];
    for (let i = 0; i < count; i++) {
      if (i < units.length) {
        newUnits.push({
          ...units[i],
          label: count === 1 ? "Entire Property" : `Unit ${i + 1}`,
        });
      } else {
        newUnits.push({
          label: count === 1 ? "Entire Property" : `Unit ${i + 1}`,
          bedroomCount: 1,
        });
      }
    }
    setUnits(newUnits);

    // Recalculate pricing if we already did the lookup
    if (lookupDone) {
      const newPricing = calculatePrice(
        newUnits.map((u) => ({ label: u.label, bedroomCount: u.bedroomCount })),
        leadPaintRequired
      );
      setPricing(newPricing);
    }
  }

  function handleBedroomChange(index: number, count: BedroomOption) {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], bedroomCount: count };
    setUnits(newUnits);

    if (lookupDone) {
      const newPricing = calculatePrice(
        newUnits.map((u) => ({ label: u.label, bedroomCount: u.bedroomCount })),
        leadPaintRequired
      );
      setPricing(newPricing);
    }
  }

  // Look up the property address via OPA API to get year built
  async function lookupAddress() {
    if (!propertyAddress.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    try {
      const res = await fetch(
        `/api/philly?address=${encodeURIComponent(propertyAddress.trim())}`
      );
      if (!res.ok) throw new Error("Lookup failed");
      const data = await res.json();

      const year = data.opaData?.year_built || null;
      const needsLead = year != null && year > 0 && year <= 1978;

      setYearBuilt(year);
      setLeadPaintRequired(needsLead);
      setLookupDone(true);

      // Calculate pricing
      const unitInputs: UnitInput[] = units.map((u) => ({
        label: u.label,
        bedroomCount: u.bedroomCount,
      }));
      setPricing(calculatePrice(unitInputs, needsLead));
    } catch {
      setLookupError(
        "Could not find this address in Philadelphia records. Double-check the format (e.g., 1234 N BROAD ST)."
      );
    } finally {
      setLookupLoading(false);
    }
  }

  // Submit Step 1 — create application and redirect to Stripe
  async function handleSubmit() {
    setSubmitting(true);
    try {
      // Create the application
      const res = await fetch("/api/rental-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyAddress: propertyAddress.trim(),
          units: units.map((u) => ({
            label: u.label,
            bedroomCount: u.bedroomCount,
          })),
        }),
      });

      if (!res.ok) throw new Error("Failed to create application");
      const data = await res.json();

      // Create Stripe checkout session and redirect
      const checkoutRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: data.application.id }),
      });

      if (!checkoutRes.ok) throw new Error("Failed to create checkout");
      const { url } = await checkoutRes.json();

      // Redirect to Stripe
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Philadelphia Rental License</CardTitle>
        <CardDescription>
          Get your rental license — enter your property details to see pricing
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Property Address */}
        <div>
          <label className="text-sm font-medium">Property Address *</label>
          <div className="flex gap-2 mt-1">
            <Input
              value={propertyAddress}
              onChange={(e) => {
                setPropertyAddress(e.target.value);
                setLookupDone(false);
                setPricing(null);
              }}
              placeholder="e.g. 1234 N BROAD ST"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={lookupAddress}
              disabled={lookupLoading || !propertyAddress.trim()}
            >
              {lookupLoading ? "Looking up..." : "Look Up"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Philadelphia address — we'll check city records to determine if a lead paint test is needed
          </p>
          {lookupError && (
            <p className="text-sm text-red-600 mt-2">{lookupError}</p>
          )}
          {lookupDone && yearBuilt && (
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={leadPaintRequired ? "destructive" : "secondary"}>
                Built {yearBuilt}
              </Badge>
              {leadPaintRequired ? (
                <span className="text-sm text-red-600">
                  Lead paint test required (pre-1978)
                </span>
              ) : (
                <span className="text-sm text-green-600">
                  No lead paint test needed
                </span>
              )}
            </div>
          )}
          {lookupDone && !yearBuilt && (
            <div className="mt-2">
              <Badge variant="outline">Year built not found</Badge>
              <span className="text-sm text-muted-foreground ml-2">
                We'll confirm lead paint requirements separately
              </span>
            </div>
          )}
        </div>

        {/* Number of Units */}
        <div>
          <label className="text-sm font-medium">Number of Units *</label>
          <Input
            type="number"
            min={1}
            max={20}
            value={unitCount}
            onChange={(e) => handleUnitCountChange(parseInt(e.target.value) || 1)}
            className="w-32 mt-1"
          />
        </div>

        {/* Bedrooms Per Unit */}
        <div>
          <label className="text-sm font-medium">Bedrooms Per Unit *</label>
          <div className="space-y-3 mt-2">
            {units.map((unit, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm w-32 text-muted-foreground">
                  {unit.label}
                </span>
                <div className="flex gap-1">
                  {([0, 1, 2, 3, 4, 5] as BedroomOption[]).map((count) => (
                    <Button
                      key={count}
                      type="button"
                      size="sm"
                      variant={unit.bedroomCount === count ? "default" : "outline"}
                      onClick={() => handleBedroomChange(i, count)}
                      className="w-14"
                    >
                      {BEDROOM_LABELS[count]}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        {pricing && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold text-lg mb-3">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span className="font-medium">{formatCents(pricing.serviceFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    License fee ({units.length} unit{units.length > 1 ? "s" : ""} x $69)
                  </span>
                  <span className="font-medium">{formatCents(pricing.licenseFee)}</span>
                </div>
                {pricing.leadPaintRequired && (
                  <>
                    <div className="text-muted-foreground text-xs font-medium mt-2">
                      Lead paint testing (property built {yearBuilt})
                    </div>
                    {pricing.leadPaintPerUnit.map((u, i) => (
                      <div key={i} className="flex justify-between pl-4">
                        <span>
                          {u.label} — {u.bedroomCount === 0 ? "Studio" : `${u.bedroomCount} BR`}
                        </span>
                        <span className="font-medium">{formatCents(u.fee)}</span>
                      </div>
                    ))}
                  </>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatCents(pricing.total)}</span>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Processing..." : `Pay ${formatCents(pricing.total)} — Proceed to Checkout`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
