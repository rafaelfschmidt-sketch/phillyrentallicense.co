"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";

function OnboardingForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("application_id");

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [detectedTitle, setDetectedTitle] = useState<{ type: string; owner1: string; owner2: string | null } | null>(null);

  const [form, setForm] = useState({
    ownerFirstName: "",
    ownerLastName: "",
    ownerPhone: "",
    ownerDob: "",
    ownerMailingAddress: "",
    titleType: "personal" as "personal" | "llc" | "other",
    hasPhtin: "" as "" | "yes" | "no" | "not_sure",
    phtin: "",
    hasLeadPaintTest: "" as "" | "yes" | "no" | "dont_remember",
    hasCAL: "" as "" | "yes" | "no",
    propertyAccessNotes: "",
    unitsOccupied: "" as "" | "yes" | "no",
    hasNaturalGas: "" as "" | "yes" | "no",
  });

  useEffect(() => {
    if (!applicationId) return;
    loadApplication();
  }, [applicationId]);

  async function loadApplication() {
    const { data } = await supabase
      .from("rental_license_applications")
      .select("*")
      .eq("id", applicationId)
      .single();

    if (data) {
      setApplication(data);
      if (data.status !== "paid" && data.status !== "pending_payment") {
        setSubmitted(true);
      }

      // Auto-detect title type from OPA
      try {
        const res = await fetch(`/api/philly?address=${encodeURIComponent(data.property_address)}`);
        if (res.ok) {
          const report = await res.json();
          const owner1 = report.opaData?.owner_1 || "";
          const owner2 = report.opaData?.owner_2 || null;
          const isLLC = /LLC|LP|INC|CORP|TRUST|PARTNER/i.test(owner1);
          const titleType = isLLC ? "llc" : "personal";

          setDetectedTitle({ type: titleType, owner1, owner2 });
          setForm((prev) => ({ ...prev, titleType: titleType as "personal" | "llc" | "other" }));
        }
      } catch { /* non-fatal */ }
    }
    setLoading(false);
  }

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!applicationId) return;
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from("rental_license_applications")
        .update({
          owner_first_name: form.ownerFirstName,
          owner_last_name: form.ownerLastName,
          owner_phone: form.ownerPhone,
          owner_dob: form.ownerDob || null,
          owner_mailing_address: form.ownerMailingAddress,
          title_type: form.titleType,
          has_phtin: form.hasPhtin === "yes",
          phtin: form.phtin || null,
          has_lead_paint_test: form.hasLeadPaintTest === "yes",
          has_commercial_activity_license: form.hasCAL === "yes",
          property_access_notes: form.propertyAccessNotes,
          units_occupied: form.unitsOccupied === "yes",
          has_natural_gas: form.hasNaturalGas === "yes",
          status: form.hasPhtin === "yes" ? "intake_complete" : "awaiting_phtin",
        })
        .eq("id", applicationId);

      if (error) throw error;

      // Notify team via Slack
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "onboarding_complete",
          propertyAddress: application?.property_address,
          ownerName: `${form.ownerFirstName} ${form.ownerLastName}`,
          ownerEmail: application?.owner_email,
          applicationId,
        }),
      }).catch(() => {});

      // Send confirmation email to client
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "onboarding_complete",
          applicationId,
          ownerName: `${form.ownerFirstName} ${form.ownerLastName}`.trim(),
          propertyAddress: application?.property_address,
          hasPhtin: form.hasPhtin === "yes",
        }),
      }).catch(() => {});

      setSubmitted(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!applicationId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center text-muted-foreground">
          Invalid link — no application ID found.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#50b8a2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#50b8a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Application Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you! Your rental license application for{" "}
              <strong>{application?.property_address as string}</strong> has
              been received.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#50b8a2]/5 border border-[#50b8a2]/20 rounded-lg p-4 text-sm">
              <p className="font-medium text-[#333543]">What happens next?</p>
              <ul className="mt-2 space-y-1 text-[#333543]/80">
                <li>Our Rental License Coordinator will review your submission</li>
                <li>We&apos;ll run compliance checks against city records</li>
                <li>You&apos;ll receive updates as we process your application</li>
              </ul>
            </div>

            {(form.hasPhtin === "no" || form.hasPhtin === "not_sure") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-800">
                  Action needed: Philadelphia Tax ID
                </p>
                <p className="text-yellow-700 mt-1">
                  Before we can submit your license application, you&apos;ll need a
                  Philadelphia Tax Identification Number (PHTIN). Visit the{" "}
                  <a
                    href="https://tax-services.phila.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Philadelphia Tax Center
                  </a>{" "}
                  to set up your account, or our Operations Manager will reach out
                  to help.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Complete Your Application</h1>
        <p className="text-muted-foreground">
          Payment received — now fill in the details we need to start your
          rental license process.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">
                {application?.property_address as string}
              </CardTitle>
              <CardDescription>
                {application?.unit_count as number} unit
                {(application?.unit_count as number) > 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Badge variant="secondary">Paid</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Owner Info */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Owner Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">First Name *</label>
                <Input
                  value={form.ownerFirstName}
                  onChange={(e) => update("ownerFirstName", e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Name *</label>
                <Input
                  value={form.ownerLastName}
                  onChange={(e) => update("ownerLastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  type="tel"
                  value={form.ownerPhone}
                  onChange={(e) => update("ownerPhone", e.target.value)}
                  placeholder="215-555-0000"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-sm font-medium">Date of Birth *</label>
              <Input
                type="date"
                value={form.ownerDob}
                onChange={(e) => update("ownerDob", e.target.value)}
              />
            </div>
            <div className="mt-3">
              <label className="text-sm font-medium">
                Mailing Address (NOT the rental property) *
              </label>
              <Textarea
                value={form.ownerMailingAddress}
                onChange={(e) => update("ownerMailingAddress", e.target.value)}
                placeholder="Owner's personal/business mailing address"
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Title & Ownership — auto-detected from city records */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Title & Ownership</h3>
            {detectedTitle ? (
              <div className="space-y-3">
                <div className="bg-muted/50 border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">According to Philadelphia city records, this property is owned by:</p>
                  <p className="font-semibold mt-1">{detectedTitle.owner1}</p>
                  {detectedTitle.owner2 && (
                    <p className="font-semibold">{detectedTitle.owner2}</p>
                  )}
                  <Badge variant="outline" className="mt-2">
                    {detectedTitle.type === "llc" ? "LLC / Entity" : "Individual"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Is this correct?</label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant={form.titleType === detectedTitle.type ? "default" : "outline"}
                      size="sm"
                      onClick={() => update("titleType", detectedTitle.type)}
                    >
                      Yes, that&apos;s correct
                    </Button>
                    <Button
                      type="button"
                      variant={form.titleType === "other" ? "default" : "outline"}
                      size="sm"
                      onClick={() => update("titleType", "other")}
                    >
                      No, this needs to be updated
                    </Button>
                  </div>
                  {form.titleType === "other" && (
                    <p className="text-sm text-yellow-700 mt-2">
                      Please contact <a href="mailto:operations@hubkey.co" className="underline font-medium">operations@hubkey.co</a> so
                      we can help resolve the ownership discrepancy before proceeding.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">
                  How do you hold title for this property? *
                </label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "personal", label: "In Your Name" },
                    { value: "llc", label: "LLC" },
                    { value: "other", label: "Other" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={form.titleType === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => update("titleType", opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Philadelphia Tax Account */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              Philadelphia Tax Account
            </h3>
            <label className="text-sm font-medium">
              Do you have a Philadelphia Tax Identification Number (PHTIN)? *
            </label>
            <div className="flex gap-2 mt-2">
              {[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
                { value: "not_sure", label: "Not Sure" },
              ].map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={
                    form.hasPhtin === opt.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => update("hasPhtin", opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {form.hasPhtin === "yes" && (
              <div className="mt-3">
                <label className="text-sm font-medium">
                  Philadelphia Tax ID Number
                </label>
                <Input
                  value={form.phtin}
                  onChange={(e) => update("phtin", e.target.value)}
                  placeholder="Enter your PHTIN"
                />
              </div>
            )}

            {(form.hasPhtin === "no" || form.hasPhtin === "not_sure") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm mt-3">
                <p className="font-medium text-yellow-800">
                  A PHTIN is required before we can submit your license
                  application.
                </p>
                <p className="text-yellow-700 mt-1">
                  You can set one up at the{" "}
                  <a
                    href="https://tax-services.phila.gov/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Philadelphia Tax Center
                  </a>
                  . Our Operations Manager will reach out to help you through
                  the process.
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Lead Paint & Licenses */}
          <div>
            <h3 className="font-semibold text-sm mb-3">
              Certifications & Licenses
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  Have you had a lead paint test completed within the past 4
                  years? *
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Required every 4 years for properties built before 1978
                </p>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                    { value: "dont_remember", label: "I Don't Remember" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={
                        form.hasLeadPaintTest === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => update("hasLeadPaintTest", opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Do you have a Commercial Activity License? *
                </label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={
                        form.hasCAL === opt.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => update("hasCAL", opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Property Details */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Property Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  How are we accessing the property? *
                </label>
                <Textarea
                  value={form.propertyAccessNotes}
                  onChange={(e) =>
                    update("propertyAccessNotes", e.target.value)
                  }
                  placeholder="e.g., Lockbox on front door, key code 1234..."
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Are any of the units occupied? *
                </label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={
                        form.unitsOccupied === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => update("unitsOccupied", opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">
                  Does the property have natural gas? *
                </label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={
                        form.hasNaturalGas === opt.value
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => update("hasNaturalGas", opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmit}
            disabled={
              submitting ||
              !form.ownerFirstName ||
              !form.ownerLastName ||
              !form.ownerPhone ||
              !form.hasPhtin ||
              !form.hasLeadPaintTest ||
              !form.hasCAL ||
              !form.propertyAccessNotes ||
              !form.unitsOccupied ||
              !form.hasNaturalGas
            }
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="px-6 py-8">
    <Suspense
      fallback={
        <Card className="max-w-2xl mx-auto">
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      }
    >
      <OnboardingForm />
    </Suspense>
    </div>
  );
}
