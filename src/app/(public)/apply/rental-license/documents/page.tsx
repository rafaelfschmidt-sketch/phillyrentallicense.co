"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { supabase } from "@/lib/supabase";

type ConversationStep = "phtin" | "photo_id" | "cal" | "settlement" | "done";

function DocumentsForm() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("application_id");

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState<ConversationStep>("phtin");
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [phtin, setPhtin] = useState("");
  const [photoIdFile, setPhotoIdFile] = useState<File | null>(null);
  const [calFile, setCalFile] = useState<File | null>(null);
  const [settlementFile, setSettlementFile] = useState<File | null>(null);
  const [hasCAL, setHasCAL] = useState<boolean | null>(null);
  const [hasSettlement, setHasSettlement] = useState<boolean | null>(null);

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
      // If PHTIN already provided, skip to photo ID
      if (data.phtin) {
        setPhtin(data.phtin as string);
        setStep("photo_id");
      }
    }
    setLoading(false);
  }

  async function uploadFile(file: File, fileType: string): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `${applicationId}/${fileType}.${ext}`;

    const { error } = await supabase.storage
      .from("application-files")
      .upload(path, file, { upsert: true });

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    // Save file record
    await supabase.from("application_files").insert({
      application_id: applicationId,
      file_type: fileType,
      file_name: file.name,
      storage_path: path,
    });

    return path;
  }

  async function handleSubmitPhtin() {
    if (!phtin.trim() || !applicationId) return;
    setSubmitting(true);

    await supabase
      .from("rental_license_applications")
      .update({ phtin: phtin.trim(), has_phtin: true })
      .eq("id", applicationId);

    await supabase.from("application_notes").insert({
      application_id: applicationId,
      author: "System",
      content: `PHTIN provided: ${phtin.trim()}`,
      is_system: true,
    });

    setSubmitting(false);
    setStep("photo_id");
  }

  async function handleSubmitPhotoId() {
    if (!photoIdFile || !applicationId) return;
    setSubmitting(true);

    await uploadFile(photoIdFile, "photo_id");

    await supabase.from("application_notes").insert({
      application_id: applicationId,
      author: "System",
      content: `Photo ID uploaded: ${photoIdFile.name}`,
      is_system: true,
    });

    setSubmitting(false);
    setStep("cal");
  }

  async function handleSubmitCAL() {
    if (!applicationId) return;
    setSubmitting(true);

    if (hasCAL && calFile) {
      await uploadFile(calFile, "commercial_activity_license");
      await supabase.from("application_notes").insert({
        application_id: applicationId,
        author: "System",
        content: `Commercial Activity License uploaded: ${calFile.name}`,
        is_system: true,
      });
    }

    setSubmitting(false);
    setStep("settlement");
  }

  async function handleSubmitSettlement() {
    if (!applicationId) return;
    setSubmitting(true);

    if (hasSettlement && settlementFile) {
      await uploadFile(settlementFile, "settlement_sheet");
      await supabase.from("application_notes").insert({
        application_id: applicationId,
        author: "System",
        content: `Settlement sheet uploaded: ${settlementFile.name}`,
        is_system: true,
      });
    }

    // Update status to intake_complete
    await supabase
      .from("rental_license_applications")
      .update({ status: "intake_complete" })
      .eq("id", applicationId);

    await supabase.from("application_notes").insert({
      application_id: applicationId,
      author: "System",
      content: "All documents submitted. Application ready for processing.",
      is_system: true,
    });

    // Notify team via Slack
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "documents_complete",
        propertyAddress: application?.property_address,
        ownerName: `${application?.owner_first_name || ""} ${application?.owner_last_name || ""}`.trim(),
        ownerEmail: application?.owner_email,
        applicationId,
      }),
    }).catch(() => {});

    setSubmitting(false);
    setStep("done");
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

  // ============================================
  // Done
  // ============================================
  if (step === "done") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#50b8a2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#50b8a2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-2xl">All Set!</CardTitle>
            <CardDescription className="text-base">
              We have everything we need to start working on your rental license
              for <strong>{application?.property_address as string}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-[#50b8a2]/5 border border-[#50b8a2]/20 rounded-lg p-4 text-sm">
              <p className="font-medium text-[#333543]">What happens next?</p>
              <ul className="mt-2 space-y-1 text-[#333543]/80">
                <li>Our team will verify your PHTIN and run compliance checks</li>
                <li>We&apos;ll obtain your Commercial Activity License if needed</li>
                <li>We&apos;ll coordinate lead paint testing if your property requires it</li>
                <li>We&apos;ll submit your rental license application through Eclipse</li>
                <li>You&apos;ll receive updates as we progress through each step</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Conversational Steps
  // ============================================
  const stepNumber = { phtin: 1, photo_id: 2, cal: 3, settlement: 4, done: 4 }[step];
  const totalSteps = 4;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Almost Done</h1>
        <p className="text-muted-foreground">
          {application?.property_address as string} — just a few more things we need from you.
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                s < stepNumber
                  ? "bg-[#50b8a2] text-white"
                  : s === stepNumber
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {s < stepNumber ? "✓" : s}
            </div>
            {s < totalSteps && <div className="w-8 h-px bg-muted-foreground/30" />}
          </div>
        ))}
      </div>

      {/* Step: PHTIN */}
      {step === "phtin" && (
        <Card>
          <CardHeader>
            <CardTitle>What is your Philadelphia Tax Identification Number?</CardTitle>
            <CardDescription>
              This is the long number found in the top left of your Philadelphia Tax Center account.
              It is not your SSN, EIN, or OPA number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={phtin}
              onChange={(e) => setPhtin(e.target.value)}
              placeholder="Enter your PHTIN"
              className="text-lg font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Don&apos;t have one yet?{" "}
              <a href="/apply/rental-license/phtin-setup" className="text-primary underline font-medium">
                Follow our step-by-step guide to get your PHTIN
              </a>
            </p>
            <Button
              className="w-full"
              onClick={handleSubmitPhtin}
              disabled={!phtin.trim() || submitting}
            >
              {submitting ? "Saving..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Photo ID */}
      {step === "photo_id" && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Photo ID</CardTitle>
            <CardDescription>
              We need a copy of your government-issued photo ID (driver&apos;s license, passport, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {photoIdFile ? (
                <div className="space-y-2">
                  <Badge variant="secondary">{photoIdFile.name}</Badge>
                  <p className="text-sm text-muted-foreground">
                    {(photoIdFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setPhotoIdFile(null)}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setPhotoIdFile(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitPhotoId}
              disabled={!photoIdFile || submitting}
            >
              {submitting ? "Uploading..." : "Continue"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: CAL */}
      {step === "cal" && (
        <Card>
          <CardHeader>
            <CardTitle>Do you have a Commercial Activity License?</CardTitle>
            <CardDescription>
              If you already have one, uploading it saves us time. If not, we&apos;ll obtain one for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={hasCAL === true ? "default" : "outline"}
                onClick={() => setHasCAL(true)}
              >
                Yes, I have one
              </Button>
              <Button
                variant={hasCAL === false ? "default" : "outline"}
                onClick={() => setHasCAL(false)}
              >
                No, I don&apos;t
              </Button>
            </div>

            {hasCAL === true && (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {calFile ? (
                  <div className="space-y-2">
                    <Badge variant="secondary">{calFile.name}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setCalFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Upload your Commercial Activity License</p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setCalFile(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmitCAL}
              disabled={submitting || hasCAL === null || (hasCAL === true && !calFile)}
            >
              {submitting ? "Saving..." : hasCAL === false ? "Continue — We'll Get One for You" : "Continue"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Settlement Sheet */}
      {step === "settlement" && (
        <Card>
          <CardHeader>
            <CardTitle>Did you purchase this property within the last 3 months?</CardTitle>
            <CardDescription>
              If so, we&apos;ll need a copy of the signed settlement sheet as proof of ownership.
              If not, we&apos;ll use the OPA record from city records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={hasSettlement === true ? "default" : "outline"}
                onClick={() => setHasSettlement(true)}
              >
                Yes, recently purchased
              </Button>
              <Button
                variant={hasSettlement === false ? "default" : "outline"}
                onClick={() => setHasSettlement(false)}
              >
                No
              </Button>
            </div>

            {hasSettlement === true && (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {settlementFile ? (
                  <div className="space-y-2">
                    <Badge variant="secondary">{settlementFile.name}</Badge>
                    <Button variant="outline" size="sm" onClick={() => setSettlementFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Upload the signed settlement sheet</p>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setSettlementFile(e.target.files?.[0] || null)}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmitSettlement}
              disabled={submitting || hasSettlement === null || (hasSettlement === true && !settlementFile)}
            >
              {submitting ? "Submitting..." : "Submit — We're All Done!"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DocumentsPage() {
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
        <DocumentsForm />
      </Suspense>
    </div>
  );
}
