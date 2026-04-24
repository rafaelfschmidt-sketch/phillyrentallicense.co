"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ============================================
// Wizard state
// ============================================
type WizardPath = "have_login" | "no_login" | "new_account" | "troubleshoot";
type TroubleshootPath = "tax_clearance" | "action_center" | "add_owner" | "schedule_call";

export default function PHTINSetupPage() {
  const [path, setPath] = useState<WizardPath>("have_login");
  const [newAccountStep, setNewAccountStep] = useState(0);
  const [troubleshootStep, setTroubleshootStep] = useState<TroubleshootPath | null>(null);
  const [entityType, setEntityType] = useState<string | null>(null);
  const [multipleProperties, setMultipleProperties] = useState<boolean | null>(null);
  const [multipleOwners, setMultipleOwners] = useState<boolean | null>(null);

  function reset() {
    setPath("have_login");
    setNewAccountStep(0);
    setTroubleshootStep(null);
    setEntityType(null);
    setMultipleProperties(null);
    setMultipleOwners(null);
  }

  // ============================================
  // Choose path
  // ============================================
  // ============================================
  // Step 1: Do you have a login?
  // ============================================
  if (path === "have_login") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold">Philadelphia Tax Identification Number (PHTIN)</h1>
          <p className="text-muted-foreground">
            A PHTIN is required before we can start your rental license. This guide will walk you through the process.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Do you have a login for the Philadelphia Tax Center?</CardTitle>
            <CardDescription>
              The Philadelphia Tax Center is at{" "}
              <a href="https://tax-services.phila.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                tax-services.phila.gov
              </a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
                onClick={() => setPath("troubleshoot")}
              >
                <CardContent className="pt-6">
                  <p className="font-semibold text-lg">Yes</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    I can log into the Philadelphia Tax Center website.
                  </p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
                onClick={() => setPath("no_login")}
              >
                <CardContent className="pt-6">
                  <p className="font-semibold text-lg">No</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    I don&apos;t have a login or have never been to this website.
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
          <p className="text-muted-foreground">
            Your PHTIN is <strong>not</strong> your Social Security Number, EIN, or OPA Number.
            It&apos;s a separate number issued by the Philadelphia Tax Center.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // Step 2 (No login): New or existing taxpayer?
  // ============================================
  if (path === "no_login") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <button onClick={() => setPath("have_login")} className="text-sm text-muted-foreground hover:text-foreground transition">
            ← Back
          </button>
          <h1 className="text-2xl font-bold mt-1">Set Up Access to the Philadelphia Tax Center</h1>
          <p className="text-muted-foreground mt-1">
            First, we need to determine if you&apos;ve ever filed taxes in Philadelphia before.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
            onClick={() => setPath("new_account")}
          >
            <CardHeader>
              <CardTitle className="text-lg">I am a new Philadelphia taxpayer</CardTitle>
              <CardDescription>
                I have <strong>never</strong> filed taxes in Philadelphia before. I need to register for the first time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">~15 minutes</Badge>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-md transition-all border-2 hover:border-primary"
            onClick={() => {
              window.open("https://tax-services.phila.gov", "_blank");
              setPath("troubleshoot");
            }}
          >
            <CardHeader>
              <CardTitle className="text-lg">I am an existing Philadelphia taxpayer</CardTitle>
              <CardDescription>
                I <strong>have</strong> filed taxes in Philadelphia before, but I don&apos;t have online access to the Tax Center yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary">~10 minutes</Badge>
                <p className="text-xs text-muted-foreground">
                  On the Tax Center website, click <strong>&ldquo;Set up online access to an existing account&rdquo;</strong> under Existing Taxpayers.
                  You&apos;ll need your SSN or EIN to link your account.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // New Account — Step by Step
  // ============================================
  if (path === "new_account") {
    const steps = [
      // Step 0: New or existing taxpayer
      {
        title: "Are you a new or existing taxpayer?",
        content: (
          <div className="space-y-4">
            <p>First, open the Philadelphia Tax Center website:</p>
            <a
              href="https://tax-services.phila.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
            >
              Open Philadelphia Tax Center
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p>Have you ever registered with the Philadelphia Tax Center before?</p>
            <div className="grid grid-cols-1 gap-2">
              <div className="border rounded-lg p-3 bg-primary/5 border-primary/20">
                <p className="font-semibold text-sm">If you are a NEW taxpayer:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scroll down to <strong>&ldquo;New Taxpayers&rdquo;</strong> and click <strong>&ldquo;Register a new taxpayer&rdquo;</strong>.
                  Then continue to the next step.
                </p>
              </div>
              <div className="border rounded-lg p-3 bg-muted/50">
                <p className="font-semibold text-sm">If you are an EXISTING taxpayer:</p>
                <p className="text-sm text-muted-foreground mt-1">
                  If you already have access to the Philadelphia Tax Center, click <strong>&ldquo;Log in to existing account&rdquo;</strong> and
                  sign in. Your PHTIN is the long number under your name in the top left corner.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  If you have a Philadelphia tax account but <strong>don&apos;t have access</strong> to the Tax Center website,
                  you&apos;ll need to register for online access. Scroll down to <strong>&ldquo;Existing Taxpayers&rdquo;</strong> and
                  click <strong>&ldquo;Set up online access to an existing account&rdquo;</strong>. You&apos;ll need your PHTIN or
                  SSN/EIN to link your account.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Having issues?{" "}
                  <button onClick={reset} className="text-primary underline font-medium">
                    Go back and select &ldquo;I have an existing Philadelphia Tax Account&rdquo;
                  </button>{" "}
                  for troubleshooting help.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      // Step 1: Registration Type
      {
        title: "Registration Type",
        content: (
          <div className="space-y-3">
            <p>You&apos;ll be asked: <em>&ldquo;Are you a third party tax professional registering on behalf of your client?&rdquo;</em></p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="font-semibold">Select: No</p>
              <p className="text-sm text-muted-foreground mt-1">You are registering yourself, not through an accountant.</p>
            </div>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 2: Entity Type
      {
        title: "Entity Type",
        content: (
          <div className="space-y-4">
            <p>Select <strong>&ldquo;I know my entity classification&rdquo;</strong>.</p>
            <p>How do you hold title for this property?</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { value: "individual", label: "In my personal name", desc: "Select Individual" },
                { value: "llc_single", label: "LLC with one owner (just me)", desc: "This is a disregarded entity — register under your personal name, not the LLC" },
                { value: "llc_multi", label: "LLC with multiple owners", desc: "Select Corporation, then add sub-classification LLC" },
                { value: "partnership", label: "Partnership", desc: "Select Partnership" },
                { value: "corporation", label: "Corporation", desc: "Select Corporation" },
              ].map((opt) => (
                <div
                  key={opt.value}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    entityType === opt.value ? "border-primary bg-primary/5" : "hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setEntityType(opt.value)}
                >
                  <p className="font-medium text-sm">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                </div>
              ))}
            </div>
            {entityType === "llc_single" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-yellow-800">Important: Disregarded Entity</p>
                <p className="text-yellow-700 mt-1">
                  Since your LLC has only one owner, it&apos;s considered a &ldquo;disregarded entity.&rdquo;
                  The PHTIN must be registered under <strong>your personal name</strong>, not the LLC name.
                </p>
              </div>
            )}
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 3: Tax Types
      {
        title: "Tax Type Selection",
        content: (
          <div className="space-y-4">
            <p>You&apos;ll see a list of available tax types. You <strong>must</strong> select both of these:</p>
            <div className="space-y-2">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-semibold">Business Income and Receipts Tax (BIRT)</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-semibold">Net Profits Tax (NPT)</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-800">This is the #1 mistake people make</p>
              <p className="text-red-700 mt-1">
                If you skip either of these, your account will get flagged when we try to submit
                your rental license. Make sure <strong>both BIRT and NPT</strong> are selected.
              </p>
            </div>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 4: ID and Name
      {
        title: "ID and Name",
        content: (
          <div className="space-y-3">
            <p>Enter the following:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong>Social Security Number</strong> (or EIN if registering as a corporation/partnership)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong>Full legal name</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span><strong>Business start date</strong></span>
              </li>
            </ul>
            {entityType === "llc_single" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                <p className="text-yellow-800">
                  Remember: use your <strong>SSN</strong> and <strong>personal name</strong>, not the LLC&apos;s EIN.
                </p>
              </div>
            )}
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 5: BIRT/NPT start date
      {
        title: "Business Income and Receipts / Net Profits Tax",
        content: (
          <div className="space-y-3">
            <p>Enter the <strong>start date</strong> for your business activity.</p>
            <p>When asked <em>&ldquo;Are you claiming New Business tax status?&rdquo;</em>:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="font-semibold">Select: No</p>
            </div>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 6: NAICS
      {
        title: "Industry Classification (NAICS)",
        content: (
          <div className="space-y-3">
            <p>You&apos;ll need to select your industry. Search for:</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 font-mono text-sm">
              Lessors of Residential Buildings and Dwellings
            </div>
            <p>Select it and click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 7: Mailing Address
      {
        title: "Mailing Address",
        content: (
          <div className="space-y-3">
            <p>Enter <strong>your personal or business mailing address</strong>.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-red-800">Do NOT enter the rental property address</p>
              <p className="text-red-700 mt-1">This must be your home address or business office — not the property you&apos;re renting out.</p>
            </div>
            <p>When asked <em>&ldquo;Does the entity own this property?&rdquo;</em> — select <strong>Yes</strong>.</p>
            <p>Click <strong>Validate Address</strong>, then <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 8: Business Location
      {
        title: "Business Location Address",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <p><em>&ldquo;Is your business location the same as your mailing address?&rdquo;</em></p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-semibold">Select: No</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><em>&ldquo;Do you have any business locations in Philadelphia or nearby?&rdquo;</em></p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-semibold">Select: Yes</p>
                <p className="text-sm text-muted-foreground">Your rental property is your business location.</p>
              </div>
            </div>
            <div className="space-y-2">
              <p><em>&ldquo;Do you have more than one business location?&rdquo;</em></p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={multipleProperties === false ? "default" : "outline"}
                  onClick={() => setMultipleProperties(false)}
                >
                  No, just one property
                </Button>
                <Button
                  size="sm"
                  variant={multipleProperties === true ? "default" : "outline"}
                  onClick={() => setMultipleProperties(true)}
                >
                  Yes, multiple properties
                </Button>
              </div>
              {multipleProperties === true && (
                <p className="text-sm text-muted-foreground">
                  Select <strong>Yes</strong> only if you have another rental property <strong>in the same name</strong> in Philadelphia.
                </p>
              )}
            </div>
            <p>Enter your <strong>rental property address</strong>, click <strong>Validate Address</strong>, then <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 9: Rental Properties + OPA
      {
        title: "Add Rental Properties",
        content: (
          <div className="space-y-4">
            <div className="space-y-2">
              <p><em>&ldquo;Do you own any rental properties in Philadelphia or nearby?&rdquo;</em></p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="font-semibold">Select: Yes</p>
              </div>
            </div>
            <p>Enter your rental property address and click <strong>Validate</strong>, then <strong>Next</strong>.</p>
            <Separator />
            <p className="font-semibold">Properties I Own</p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">1.</span>
                <span>Click <strong>&ldquo;Add A Property&rdquo;</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">2.</span>
                <span>Search for your street address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">3.</span>
                <span>The search results will show the OPA record for your property</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">4.</span>
                <span>Click the <strong>blue OPA Number</strong> to select it</span>
              </li>
            </ol>
            <Separator />
            <p className="font-semibold">Property Owners — &ldquo;Are any of these you?&rdquo;</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>If you see your name, click the bubble next to it and click <strong>OK</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  If you <strong>don&apos;t</strong> see your name, call the Department of Revenue
                  at <strong>215-686-6442</strong>. This can happen if you recently purchased the property
                  and the city records haven&apos;t updated yet.
                </span>
              </li>
            </ul>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 10: Contact Info
      {
        title: "Contact Information",
        content: (
          <div className="space-y-3">
            <p>Enter all of your contact information.</p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <p className="font-semibold">Set Preferred Mail Delivery to: Electronic</p>
              <p className="text-sm text-muted-foreground mt-1">This ensures you get notifications by email instead of paper mail.</p>
            </div>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 11: Username/Password
      {
        title: "Create Username and Password",
        content: (
          <div className="space-y-3">
            <p>Choose a <strong>username</strong>, <strong>password</strong>, and <strong>secret question</strong>.</p>
            <p className="text-sm text-muted-foreground">Save these somewhere safe — you&apos;ll need them to log back in.</p>
            <p>Click <strong>Next</strong>.</p>
          </div>
        ),
      },
      // Step 12: Review and Submit
      {
        title: "Review and Submit",
        content: (
          <div className="space-y-4">
            <p>You&apos;ll see a <strong>Taxpayer Registration Summary</strong>. Review everything carefully.</p>
            <ol className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">1.</span>
                <span>Check the box under <strong>&ldquo;Confirm Registration&rdquo;</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground font-mono w-5 shrink-0">2.</span>
                <span>Click <strong>Submit</strong></span>
              </li>
            </ol>
            <Separator />
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-800">Finding Your PHTIN</p>
              <p className="text-sm text-green-700 mt-1">
                Once registration is complete, log into your Tax Center account. Under your name
                in the top left corner, you&apos;ll see a long number — <strong>that&apos;s your Philadelphia
                Tax Identification Number</strong>. Copy it and provide it to HubKey.
              </p>
            </div>
          </div>
        ),
      },
    ];

    const currentStep = steps[newAccountStep];
    const isLastStep = newAccountStep === steps.length - 1;

    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground transition">
              ← Back to options
            </button>
            <h1 className="text-2xl font-bold mt-1">Register for a PHTIN</h1>
          </div>
          <Badge variant="outline">
            Step {newAccountStep + 1} of {steps.length}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${((newAccountStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentStep.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {currentStep.content}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setNewAccountStep(Math.max(0, newAccountStep - 1))}
            disabled={newAccountStep === 0}
          >
            Previous
          </Button>
          {isLastStep ? (
            <Button onClick={reset}>Done — Back to Start</Button>
          ) : (
            <Button onClick={() => setNewAccountStep(newAccountStep + 1)}>
              Next Step
            </Button>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // Troubleshoot existing account
  // ============================================
  if (path === "troubleshoot") {
    if (!troubleshootStep) {
      return (
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div>
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground transition">
              ← Back to options
            </button>
            <h1 className="text-2xl font-bold mt-1">Troubleshoot Your PHTIN</h1>
            <p className="text-muted-foreground mt-1">
              Let&apos;s figure out what&apos;s going on with your Philadelphia Tax Center account.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Step 1: Check Your Tax Clearance</CardTitle>
              <CardDescription>This will tell us if there are any issues with your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">1.</span>
                  <span>
                    Log into the{" "}
                    <a href="https://tax-services.phila.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">
                      Philadelphia Tax Center
                    </a>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">2.</span>
                  <span>Click <strong>&ldquo;More Options&rdquo;</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">3.</span>
                  <span>Scroll to the bottom and select <strong>&ldquo;Tax Certificate / Tax Clearance&rdquo;</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">4.</span>
                  <span>Select <strong>&ldquo;Permits/Licenses&rdquo;</strong></span>
                </li>
              </ol>

              <Separator />

              <p className="font-semibold">What do you see on the right side of the screen?</p>

              <div className="grid grid-cols-1 gap-2">
                <div
                  className="border rounded-lg p-3 cursor-pointer hover:border-green-500 transition-all"
                  onClick={() => setTroubleshootStep("tax_clearance")}
                >
                  <p className="font-medium text-sm text-green-700">I received a Tax Clearance Certificate</p>
                  <p className="text-xs text-muted-foreground">Great — your account looks good!</p>
                </div>
                <div
                  className="border rounded-lg p-3 cursor-pointer hover:border-red-500 transition-all"
                  onClick={() => setTroubleshootStep("action_center")}
                >
                  <p className="font-medium text-sm text-red-700">I see an error message</p>
                  <p className="text-xs text-muted-foreground">We&apos;ll walk through fixing it.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Do you have multiple owners on this property?</CardTitle>
              <CardDescription>
                If the property is jointly owned (with a spouse, partner, etc.), all owners must be on the tax account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={multipleOwners === true ? "default" : "outline"}
                  onClick={() => { setMultipleOwners(true); setTroubleshootStep("add_owner"); }}
                >
                  Yes — I need to add someone
                </Button>
                <Button
                  size="sm"
                  variant={multipleOwners === false ? "default" : "outline"}
                  onClick={() => setMultipleOwners(false)}
                >
                  No — just me
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Troubleshoot sub-steps
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        <div>
          <button
            onClick={() => setTroubleshootStep(null)}
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            ← Back to troubleshooting
          </button>
          <h1 className="text-2xl font-bold mt-1">Troubleshoot Your PHTIN</h1>
        </div>

        {troubleshootStep === "tax_clearance" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">Your account looks good!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                You received a Tax Clearance Certificate, which means your Philadelphia Tax Center
                account is properly set up.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="font-semibold">Next step:</p>
                <p className="mt-1">
                  Please email a copy of your Tax Clearance Certificate to{" "}
                  <a href="mailto:license@hubkey.co" className="text-primary underline font-medium">
                    license@hubkey.co
                  </a>{" "}
                  so we can proceed with your rental license.
                </p>
              </div>
              <p>
                Also make sure to provide your <strong>PHTIN</strong> — log into the Tax Center,
                and the long number under your name in the top left is your Tax Identification Number.
              </p>
            </CardContent>
          </Card>
        )}

        {troubleshootStep === "action_center" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">Let&apos;s Fix the Error</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>Common reasons your Tax Clearance was denied:</p>

              <div className="space-y-3">
                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Missing BIRT or NPT Tax Registration</p>
                  <p className="text-muted-foreground mt-1">
                    Your account needs both <strong>Business Income and Receipts Tax (BIRT)</strong> and{" "}
                    <strong>Net Profits Tax (NPT)</strong> registered. If either is missing, the clearance will fail.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Unfiled Tax Returns</p>
                  <p className="text-muted-foreground mt-1">
                    You may have outstanding BIRT or NPT returns that need to be filed, even if you owe $0.
                  </p>
                </div>

                <div className="border rounded-lg p-3">
                  <p className="font-semibold">Outstanding Balance</p>
                  <p className="text-muted-foreground mt-1">
                    There may be unpaid taxes, fees, or penalties on your account.
                  </p>
                </div>
              </div>

              <Separator />

              <p className="font-semibold">Check your Action Center:</p>
              <ol className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">1.</span>
                  <span>Go to the <strong>Action Center</strong> in your Tax Center dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">2.</span>
                  <span>Check for any required documents or updates needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">3.</span>
                  <span>Verify your address and demographic information is correct</span>
                </li>
              </ol>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-800">Take a screenshot of the error</p>
                <p className="text-yellow-700 mt-1">
                  Email the screenshot to{" "}
                  <a href="mailto:license@hubkey.co" className="underline font-medium">
                    license@hubkey.co
                  </a>{" "}
                  and we&apos;ll help you resolve it.
                </p>
              </div>

              <Separator />

              <div className="text-center">
                <p className="text-muted-foreground mb-3">Still stuck? We can help.</p>
                <Button onClick={() => setTroubleshootStep("schedule_call")}>
                  Schedule a Call with Our Team
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {troubleshootStep === "add_owner" && (
          <Card>
            <CardHeader>
              <CardTitle>Add Another Owner to Your Tax Account</CardTitle>
              <CardDescription>
                All owners on the property title must be listed on the Philadelphia Tax Center account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <ol className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">1.</span>
                  <span>Log into the <a href="https://tax-services.phila.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium">Philadelphia Tax Center</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">2.</span>
                  <span>Click <strong>&ldquo;More Options&rdquo;</strong> at the top</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">3.</span>
                  <span>Scroll down to the <strong>&ldquo;Responsible Parties&rdquo;</strong> section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">4.</span>
                  <span>Click <strong>&ldquo;Add or update responsible parties&rdquo;</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">5.</span>
                  <span>Click <strong>&ldquo;Add a Responsible Party&rdquo;</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">6.</span>
                  <span>Enter their <strong>name</strong>, <strong>Social Security Number</strong>, and <strong>mailing address</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">7.</span>
                  <span>Click the blue <strong>Next</strong> button</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground font-mono w-5 shrink-0">8.</span>
                  <span>Click the blue <strong>Summary</strong> button to confirm</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {troubleshootStep === "schedule_call" && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule a Call</CardTitle>
              <CardDescription>
                Our Operations Manager can help you troubleshoot your Philadelphia Tax Center account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                We understand this process can be overwhelming. Schedule a call or Google Meet
                with our Operations Manager and they&apos;ll walk you through it.
              </p>
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <p className="font-semibold">Email us at:</p>
                <a
                  href="mailto:license@hubkey.co?subject=PHTIN Help — Need to Schedule a Call"
                  className="text-primary underline font-medium text-lg"
                >
                  license@hubkey.co
                </a>
                <p className="text-muted-foreground mt-2">
                  Include your name, property address, and a screenshot of the error you&apos;re seeing.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
}
