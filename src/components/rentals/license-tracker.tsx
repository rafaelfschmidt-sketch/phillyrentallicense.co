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
import { Textarea } from "@/components/ui/textarea";
import type { RentalLicenseApplication } from "@/types/rentals";

interface TrackerProps {
  application: RentalLicenseApplication;
}

export function RentalLicenseTracker({ application }: TrackerProps) {
  const [newNote, setNewNote] = useState("");
  const [runningCheck, setRunningCheck] = useState(false);
  const [complianceResult, setComplianceResult] = useState<Record<string, unknown> | null>(null);

  async function runComplianceCheck() {
    setRunningCheck(true);
    try {
      const res = await fetch(
        `/api/philly?address=${encodeURIComponent(application.propertyAddress)}`
      );
      if (res.ok) {
        const data = await res.json();
        setComplianceResult(data);
      }
    } catch {
      // handle error
    } finally {
      setRunningCheck(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{application.propertyAddress}</CardTitle>
              <CardDescription>
                {application.ownerName} &middot; {application.ownerEmail} &middot;{" "}
                {application.ownerPhone}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge
                variant={
                  application.status === "awaiting_phtin" || application.status === "blocked"
                    ? "destructive"
                    : application.status === "completed"
                      ? "outline"
                      : "default"
                }
                className="text-sm"
              >
                {application.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1">
                Started {new Date(application.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={runComplianceCheck}
              disabled={runningCheck}
            >
              {runningCheck ? "Checking..." : "Run City Compliance Check"}
            </Button>
            {application.phtin && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">PHTIN:</span>
                <span className="font-mono font-medium">{application.phtin}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Results */}
      {complianceResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">City Compliance Check</CardTitle>
              <Badge
                variant={
                  (complianceResult as { readinessScore?: number }).readinessScore !== undefined &&
                  ((complianceResult as { readinessScore: number }).readinessScore >= 75)
                    ? "secondary"
                    : "destructive"
                }
              >
                Score: {(complianceResult as { readinessScore?: number }).readinessScore ?? "N/A"}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {(complianceResult as { blockers?: string[] }).blockers &&
              ((complianceResult as { blockers: string[] }).blockers).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="font-medium text-red-800 text-sm">Blockers:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {((complianceResult as { blockers: string[] }).blockers).map((b: string, i: number) => (
                    <li key={i} className="text-sm text-red-700">{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {(complianceResult as { warnings?: string[] }).warnings &&
              ((complianceResult as { warnings: string[] }).warnings).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="font-medium text-yellow-800 text-sm">Warnings:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {((complianceResult as { warnings: string[] }).warnings).map((w: string, i: number) => (
                    <li key={i} className="text-sm text-yellow-700">{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step-by-Step Tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Process Steps</CardTitle>
          <CardDescription>
            Step {application.currentStep} of {application.totalSteps}
          </CardDescription>
          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all"
              style={{
                width: `${(application.currentStep / application.totalSteps) * 100}%`,
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {application.steps.map((step, i) => (
              <div key={step.id}>
                <div className="flex items-start gap-3 py-3">
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {step.status === "completed" && (
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    {step.status === "active" && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    )}
                    {step.status === "blocked" && (
                      <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {step.status === "pending" && (
                      <div className="w-6 h-6 rounded-full bg-muted border-2 border-muted-foreground/30" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          step.status === "completed"
                            ? "text-green-700"
                            : step.status === "active"
                              ? "text-blue-700"
                              : step.status === "blocked"
                                ? "text-red-700"
                                : "text-muted-foreground"
                        }`}
                      >
                        {step.name}
                      </span>
                      {step.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(step.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {step.blocker && (
                      <p className="text-xs text-red-600 mt-1">
                        Blocker: {step.blocker}
                      </p>
                    )}
                    {step.status === "active" && (
                      <Button size="sm" className="mt-2" variant="outline">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
                {i < application.steps.length - 1 && (
                  <div className="ml-3 w-px h-2 bg-muted-foreground/20" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity / Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {application.notes.map((note, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                  {note.author === "System" ? "SYS" : note.author.split(" ").map(w => w[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{note.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.content}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Add Note */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button
              size="sm"
              className="self-end"
              disabled={!newNote.trim()}
              onClick={() => {
                // Will save to Supabase
                setNewNote("");
              }}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
