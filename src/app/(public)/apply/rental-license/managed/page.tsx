"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: "Owner & Property" },
  { num: 2, label: "Title & Ownership" },
  { num: 3, label: "Tax & Compliance" },
  { num: 4, label: "Property Details" },
];

export default function ManagedRentalLicenseForm() {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1 — Owner & Property
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Philadelphia");
  const [state, setState] = useState("PA");
  const [zipCode, setZipCode] = useState("");
  const [isNewConstruction, setIsNewConstruction] = useState<"yes" | "no" | "">("");

  // Step 2 — Title & Ownership
  const [titleType, setTitleType] = useState<"personal" | "llc" | "">("");
  const [ownerCount, setOwnerCount] = useState<1 | 2>(1);
  const [partnerRelationship, setPartnerRelationship] = useState<"spouses" | "domestic_partners" | "other" | "">("");
  const [ssn1, setSsn1] = useState("");
  const [owner2Name, setOwner2Name] = useState("");
  const [ssn2, setSsn2] = useState("");
  const [owner2Street, setOwner2Street] = useState("");
  const [owner2City, setOwner2City] = useState("");
  const [owner2State, setOwner2State] = useState("");
  const [owner2Zip, setOwner2Zip] = useState("");
  // LLC fields
  const [isDisregardedEntity, setIsDisregardedEntity] = useState<"yes" | "no" | "">("");
  const [disregardedEntityDetails, setDisregardedEntityDetails] = useState("");
  const [hasEin, setHasEin] = useState<"yes" | "no" | "">("");
  const [ein, setEin] = useState("");

  // Step 3 — Tax & Compliance
  const [hasTaxAccount, setHasTaxAccount] = useState<"yes" | "no" | "not_sure" | "">("");
  const [phtin, setPhtin] = useState("");
  const [hasCAL, setHasCAL] = useState<"yes" | "no" | "not_sure" | "">("");
  const [calNumber, setCalNumber] = useState("");
  const [hasRentalLicense, setHasRentalLicense] = useState<"yes" | "no" | "not_sure" | "">("");
  const [rentalLicenseNumber, setRentalLicenseNumber] = useState("");
  const [hasLeadPaintTest, setHasLeadPaintTest] = useState<"yes" | "no" | "not_sure" | "">("");
  const [hasLeadPaintCopy, setHasLeadPaintCopy] = useState<"yes" | "no" | "">("");

  // Step 4 — Property Details
  const [hasNaturalGas, setHasNaturalGas] = useState<"yes" | "no" | "">("");
  const [hasPGWEnrollment, setHasPGWEnrollment] = useState<"yes" | "no" | "dont_know" | "">("");
  const [notes, setNotes] = useState("");

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return !!(ownerFirstName && ownerLastName && ownerEmail && streetAddress && zipCode && isNewConstruction);
      case 2:
        if (!titleType) return false;
        if (!ssn1) return false;
        if (ownerCount === 2 && (!partnerRelationship || !owner2Name || !ssn2)) return false;
        if (titleType === "llc" && !isDisregardedEntity) return false;
        return true;
      case 3:
        return !!(hasTaxAccount && hasCAL && hasRentalLicense && hasLeadPaintTest);
      case 4:
        return !!(hasNaturalGas);
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const propertyAddress = streetAddress.trim().toUpperCase();

      const res = await fetch("/api/rental-license/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType: "managed",
          propertyAddress,
          ownerFirstName: ownerFirstName.trim(),
          ownerLastName: ownerLastName.trim(),
          ownerEmail: ownerEmail.trim(),
          isNewConstruction: isNewConstruction === "yes",
          titleType,
          ownerCount,
          partnerRelationship: ownerCount === 2 ? partnerRelationship : null,
          owner2Name: ownerCount === 2 ? owner2Name : null,
          owner2MailingAddress: ownerCount === 2
            ? [owner2Street, owner2City, owner2State, owner2Zip].filter(Boolean).join(", ")
            : null,
          isDisregardedEntity: titleType === "llc" ? isDisregardedEntity === "yes" : null,
          ein: hasEin === "yes" ? ein : null,
          hasPhtin: hasTaxAccount === "yes" ? "yes" : hasTaxAccount === "no" ? "no" : "not_sure",
          phtin: hasTaxAccount === "yes" ? phtin : null,
          hasCAL: hasCAL === "yes" ? "yes" : "no",
          calNumber: hasCAL === "yes" ? calNumber : null,
          hasRentalLicense: hasRentalLicense === "yes" ? "yes" : "no",
          rentalLicenseNumber: hasRentalLicense === "yes" ? rentalLicenseNumber : null,
          hasLeadPaintTest: hasLeadPaintTest === "yes" ? "yes" : hasLeadPaintTest === "no" ? "no" : "not_sure",
          hasLeadPaintCopy: hasLeadPaintTest === "yes" ? hasLeadPaintCopy === "yes" : null,
          hasNaturalGas: hasNaturalGas === "yes" ? "yes" : "no",
          hasPGWEnrollment: hasNaturalGas === "yes" ? hasPGWEnrollment : null,
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }

      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            <CardTitle className="text-2xl">Form Submitted</CardTitle>
            <CardDescription className="text-base">
              Thank you! Your rental license information for{" "}
              <strong>{streetAddress.toUpperCase()}</strong> has been received.
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

            {hasTaxAccount !== "yes" && (
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
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Philadelphia Rental License</h1>
        <p className="text-muted-foreground">
          Complete this form so we can get started on your rental license.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.num < step) setStep(s.num as Step);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                s.num === step
                  ? "bg-[#50b8a2] text-white"
                  : s.num < step
                  ? "bg-[#50b8a2]/15 text-[#50b8a2] cursor-pointer hover:bg-[#50b8a2]/25"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {s.num < step ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{s.num}</span>
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {s.num < 4 && (
              <div className={`w-6 h-px ${s.num < step ? "bg-[#50b8a2]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Owner & Property */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Owner & Property Information</CardTitle>
            <CardDescription>Your legal name and the rental property address.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Full Legal Name *</label>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Input
                  value={ownerFirstName}
                  onChange={(e) => setOwnerFirstName(e.target.value)}
                  placeholder="First Name"
                />
                <Input
                  value={ownerLastName}
                  onChange={(e) => setOwnerLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email Address *</label>
              <Input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@email.com"
                className="mt-1"
              />
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium">Rental Property Address *</label>
              <div className="space-y-3 mt-1">
                <div>
                  <Input
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street Address (including unit number if applicable)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="Zip Code"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Is this property new construction? *</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={isNewConstruction === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsNewConstruction(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!canAdvance()}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2 — Title & Ownership */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Title & Ownership</CardTitle>
            <CardDescription>How the property is owned and who the owners are.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">How do you hold title for the property? *</label>
              <p className="text-xs text-muted-foreground mt-0.5">
                &quot;Personally&quot; means you own it in your own name, not an LLC
              </p>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "personal" as const, label: "Personally" },
                  { value: "llc" as const, label: "LLC / Entity" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={titleType === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTitleType(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">How many people own the property? *</label>
              <div className="flex gap-2 mt-2">
                {[1, 2].map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={ownerCount === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setOwnerCount(n as 1 | 2)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            </div>

            {ownerCount === 2 && (
              <div>
                <label className="text-sm font-medium">Who are the partners? *</label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "spouses" as const, label: "Spouses" },
                    { value: "domestic_partners" as const, label: "Domestic Partners" },
                    { value: "other" as const, label: "Other" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={partnerRelationship === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPartnerRelationship(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium">SSN for Owner #1 *</label>
              <Input
                type="password"
                value={ssn1}
                onChange={(e) => setSsn1(e.target.value)}
                placeholder="XXX-XX-XXXX"
                className="mt-1"
                autoComplete="off"
              />
            </div>

            {ownerCount === 2 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Owner #2 Name *</label>
                  <Input
                    value={owner2Name}
                    onChange={(e) => setOwner2Name(e.target.value)}
                    placeholder="Full legal name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">SSN for Owner #2 *</label>
                  <Input
                    type="password"
                    value={ssn2}
                    onChange={(e) => setSsn2(e.target.value)}
                    placeholder="XXX-XX-XXXX"
                    className="mt-1"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mailing Address for 2nd Owner *</label>
                  <div className="space-y-3 mt-1">
                    <Input
                      value={owner2Street}
                      onChange={(e) => setOwner2Street(e.target.value)}
                      placeholder="Street Address (including unit number if applicable)"
                    />
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={owner2City}
                        onChange={(e) => setOwner2City(e.target.value)}
                        placeholder="City"
                      />
                      <Input
                        value={owner2State}
                        onChange={(e) => setOwner2State(e.target.value)}
                        placeholder="State"
                      />
                      <Input
                        value={owner2Zip}
                        onChange={(e) => setOwner2Zip(e.target.value)}
                        placeholder="Zip Code"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {titleType === "llc" && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium">Is the LLC filed as a disregarded entity? *</label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { value: "yes" as const, label: "Yes" },
                      { value: "no" as const, label: "No" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={isDisregardedEntity === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIsDisregardedEntity(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {isDisregardedEntity === "yes" && (
                  <div>
                    <label className="text-sm font-medium">For disregarded entities, please provide...</label>
                    <Textarea
                      value={disregardedEntityDetails}
                      onChange={(e) => setDisregardedEntityDetails(e.target.value)}
                      placeholder="Additional details about the disregarded entity"
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">
                    Does the business entity have an EIN used specifically for the property?
                  </label>
                  <div className="flex gap-2 mt-2">
                    {[
                      { value: "yes" as const, label: "Yes" },
                      { value: "no" as const, label: "No" },
                    ].map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={hasEin === opt.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setHasEin(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {hasEin === "yes" && (
                  <div>
                    <label className="text-sm font-medium">EIN *</label>
                    <Input
                      value={ein}
                      onChange={(e) => setEin(e.target.value)}
                      placeholder="XX-XXXXXXX"
                      className="mt-1"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)} disabled={!canAdvance()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3 — Tax & Compliance */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax & Compliance</CardTitle>
            <CardDescription>Tax account, licenses, and lead paint information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* PHTIN Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
              <p className="font-semibold text-red-800">
                In order to handle obtaining your rental licensing, we MUST have your Philadelphia Tax Identification Number.
              </p>
              <p className="text-red-700 mt-1">
                If you aren&apos;t sure, or don&apos;t remember your login info, you will have to find that
                information before submitting this form. Visit the{" "}
                <a
                  href="https://tax-services.phila.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  Philadelphia Tax Center
                </a>{" "}
                for instructions. If you have an accountant who has this information, please speak to them.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Do you have a Philadelphia Tax Center Account? *</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                  { value: "not_sure" as const, label: "Not Sure" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={hasTaxAccount === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHasTaxAccount(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasTaxAccount === "yes" && (
              <div>
                <label className="text-sm font-medium">What is your Philadelphia Tax Identification Number? *</label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This is the long number under your name when logged into your Tax Center Account
                </p>
                <Input
                  value={phtin}
                  onChange={(e) => setPhtin(e.target.value)}
                  placeholder="Enter your PHTIN"
                  className="mt-1"
                />
              </div>
            )}

            {(hasTaxAccount === "no" || hasTaxAccount === "not_sure") && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-yellow-800">
                  We cannot proceed without your PHTIN.
                </p>
                <p className="text-yellow-700 mt-1">
                  You can still submit this form and we&apos;ll follow up, but your application
                  will be on hold until your PHTIN is provided. Our Operations Manager can help
                  you through the process.
                </p>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium">Do you have a Commercial Activity License? *</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                  { value: "not_sure" as const, label: "Not Sure" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={hasCAL === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHasCAL(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasCAL === "yes" && (
              <div>
                <label className="text-sm font-medium">Commercial Activity License Number</label>
                <Input
                  value={calNumber}
                  onChange={(e) => setCalNumber(e.target.value)}
                  placeholder="License number"
                  className="mt-1"
                />
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium">Do you have a Rental License? *</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                  { value: "not_sure" as const, label: "Not Sure" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={hasRentalLicense === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHasRentalLicense(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasRentalLicense === "yes" && (
              <div>
                <label className="text-sm font-medium">Rental License Number</label>
                <Input
                  value={rentalLicenseNumber}
                  onChange={(e) => setRentalLicenseNumber(e.target.value)}
                  placeholder="License number"
                  className="mt-1"
                />
              </div>
            )}

            <Separator />

            {/* Lead Paint */}
            <div>
              <div className="bg-muted/50 border rounded-lg p-4 text-sm mb-4">
                <p className="text-muted-foreground">
                  The City of Philadelphia requires a lead-based paint test every four (4) years on
                  rental properties built before 1978. If you haven&apos;t had a test done in the
                  prior 4 years, or you can&apos;t remember, we will get that test done for you.
                </p>
                <p className="text-muted-foreground mt-2">
                  Please note that even if a property has been remodeled or completely rebuilt, if the
                  original structure was built prior to 1978, the city will still consider it a
                  pre-1978 property subject to lead-based paint testing.
                </p>
              </div>

              <label className="text-sm font-medium">
                Have you had a Lead Paint Test completed within the past 4 years? *
              </label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                  { value: "not_sure" as const, label: "Not Sure" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={hasLeadPaintTest === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHasLeadPaintTest(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasLeadPaintTest === "yes" && (
              <div>
                <label className="text-sm font-medium">Do you have a copy of your lead-based paint test results? *</label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes" as const, label: "Yes" },
                    { value: "no" as const, label: "No" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={hasLeadPaintCopy === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHasLeadPaintCopy(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(4)} disabled={!canAdvance()}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4 — Property Details & Submit */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property Details</CardTitle>
            <CardDescription>Gas service, PGW enrollment, and any additional notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium">Does your property have natural gas? *</label>
              <div className="flex gap-2 mt-2">
                {[
                  { value: "yes" as const, label: "Yes" },
                  { value: "no" as const, label: "No" },
                ].map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={hasNaturalGas === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHasNaturalGas(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {hasNaturalGas === "yes" && (
              <div>
                <label className="text-sm font-medium">
                  Have you enrolled in PGW&apos;s Landlord Cooperation Program? *
                </label>
                <div className="flex gap-2 mt-2">
                  {[
                    { value: "yes" as const, label: "Yes" },
                    { value: "no" as const, label: "No" },
                    { value: "dont_know" as const, label: "I Don't Know" },
                  ].map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      variant={hasPGWEnrollment === opt.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setHasPGWEnrollment(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information or special instructions..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <Separator />
            <div className="bg-muted/50 border rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-[#333543]">Review Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#333543]/80">
                <span>Owner:</span>
                <span className="font-medium">{ownerFirstName} {ownerLastName}</span>
                <span>Property:</span>
                <span className="font-medium">{streetAddress}</span>
                <span>Title:</span>
                <span className="font-medium">{titleType === "llc" ? "LLC / Entity" : "Personal"}</span>
                <span>Tax Account:</span>
                <span className="font-medium">
                  {hasTaxAccount === "yes" ? `Yes — ${phtin || "provided"}` : hasTaxAccount === "no" ? "No" : "Not Sure"}
                </span>
                <span>Natural Gas:</span>
                <span className="font-medium">{hasNaturalGas === "yes" ? "Yes" : "No"}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting || !canAdvance()}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
