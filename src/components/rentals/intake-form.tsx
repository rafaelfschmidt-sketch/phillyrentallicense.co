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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface IntakeProps {
  onClose: () => void;
}

export function RentalLicenseIntake({ onClose }: IntakeProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerMailingAddress: "",
    propertyAddress: "",
    propertyUnit: "",
    propertyType: "single-family" as "single-family" | "multifamily",
    numberOfUnits: "",
    hasPhillyTaxId: false,
    phillyTaxId: "",
    serviceType: "managed" as "managed" | "license_only" | "leasing_only",
  });

  function update(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>New Rental License Application</CardTitle>
              <CardDescription>
                This replaces the Jotform — data flows directly into the system
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
          {/* Step Indicator */}
          <div className="flex gap-2 mt-4">
            {["Owner Info", "Property", "Tax & Service"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > i + 1
                      ? "bg-green-600 text-white"
                      : step === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm ${
                    step === i + 1 ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {i < 2 && (
                  <div className="w-8 h-px bg-muted-foreground/30 mx-1" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step 1: Owner Info */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    value={formData.ownerFirstName}
                    onChange={(e) => update("ownerFirstName", e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    value={formData.ownerLastName}
                    onChange={(e) => update("ownerLastName", e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => update("ownerEmail", e.target.value)}
                  placeholder="owner@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => update("ownerPhone", e.target.value)}
                  placeholder="215-555-0000"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Mailing Address (NOT the rental property) *
                </label>
                <Textarea
                  value={formData.ownerMailingAddress}
                  onChange={(e) =>
                    update("ownerMailingAddress", e.target.value)
                  }
                  placeholder="Owner's personal/business mailing address"
                  rows={2}
                />
              </div>
            </>
          )}

          {/* Step 2: Property */}
          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-medium">
                  Property Address *
                </label>
                <Input
                  value={formData.propertyAddress}
                  onChange={(e) => update("propertyAddress", e.target.value)}
                  placeholder="e.g. 1234 N BROAD ST"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This address will be used to automatically check OPA, Atlas,
                  and L&I records
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Unit (if applicable)</label>
                <Input
                  value={formData.propertyUnit}
                  onChange={(e) => update("propertyUnit", e.target.value)}
                  placeholder="e.g. Unit 2, Apt B"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Property Type *</label>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={
                      formData.propertyType === "single-family"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => update("propertyType", "single-family")}
                  >
                    Single Family
                  </Button>
                  <Button
                    type="button"
                    variant={
                      formData.propertyType === "multifamily"
                        ? "default"
                        : "outline"
                    }
                    onClick={() => update("propertyType", "multifamily")}
                  >
                    Multifamily
                  </Button>
                </div>
              </div>
              {formData.propertyType === "multifamily" && (
                <div>
                  <label className="text-sm font-medium">
                    Number of Units
                  </label>
                  <Input
                    type="number"
                    value={formData.numberOfUnits}
                    onChange={(e) => update("numberOfUnits", e.target.value)}
                    placeholder="e.g. 4"
                  />
                </div>
              )}
            </>
          )}

          {/* Step 3: Tax & Service */}
          {step === 3 && (
            <>
              <div>
                <label className="text-sm font-medium">
                  Do you have a Philadelphia Tax Identification Number (PHTIN)?
                  *
                </label>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={formData.hasPhillyTaxId ? "default" : "outline"}
                    onClick={() => update("hasPhillyTaxId", true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!formData.hasPhillyTaxId ? "default" : "outline"}
                    onClick={() => update("hasPhillyTaxId", false)}
                  >
                    No
                  </Button>
                </div>
              </div>

              {formData.hasPhillyTaxId && (
                <div>
                  <label className="text-sm font-medium">
                    Philadelphia Tax ID Number
                  </label>
                  <Input
                    value={formData.phillyTaxId}
                    onChange={(e) => update("phillyTaxId", e.target.value)}
                    placeholder="Enter your PHTIN"
                  />
                </div>
              )}

              {!formData.hasPhillyTaxId && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-yellow-800">
                    A PHTIN is required before we can start the rental license
                    process.
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
                    . Once your application is submitted, our Operations Manager
                    will reach out to help you through the process.
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <label className="text-sm font-medium">Service Type *</label>
                <div className="space-y-2 mt-2">
                  {[
                    {
                      value: "managed",
                      label: "Managed Client",
                      desc: "HubKey manages the property — rental license included at no extra charge",
                    },
                    {
                      value: "license_only",
                      label: "License Only",
                      desc: "Rental license procurement service — requires agreement and payment",
                    },
                    {
                      value: "leasing_only",
                      label: "Leasing Only",
                      desc: "Tenant placement + rental license if needed — $250 licensing fee",
                    },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        formData.serviceType === opt.value
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/50"
                      }`}
                      onClick={() => update("serviceType", opt.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {opt.label}
                        </span>
                        {formData.serviceType === opt.value && (
                          <Badge>Selected</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {opt.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
            >
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)}>Continue</Button>
            ) : (
              <Button
                onClick={() => {
                  // Will submit to Supabase + trigger compliance check
                  alert(
                    "Application submitted! In production this creates the workflow and runs the compliance check."
                  );
                  onClose();
                }}
              >
                Submit Application
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
