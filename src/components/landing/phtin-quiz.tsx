"use client";

import { useState } from "react";
import posthog from "posthog-js";
import { Animate } from "./animate";
import { createClient } from "@/lib/supabase-browser";

type PhtinAnswer = "yes" | "no" | "not_sure" | "";
type BirtAnswer = "yes" | "no" | "dont_know" | "";
type SpouseAnswer = "yes" | "no" | "na" | "";

type Result = "ready" | "needs_setup" | "not_sure";

function classify(
  phtin: PhtinAnswer,
  birt: BirtAnswer,
  spouse: SpouseAnswer
): Result {
  if (phtin === "no") return "needs_setup";
  if (phtin === "not_sure") return "not_sure";
  if (phtin === "yes" && birt === "yes" && (spouse === "yes" || spouse === "na")) {
    return "ready";
  }
  if (phtin === "yes" && (birt === "no" || spouse === "no")) return "needs_setup";
  return "not_sure";
}

function getApplyUrl(pathAndQuery: string): string {
  const base = process.env.NEXT_PUBLIC_APPLY_URL || "";
  if (base) return `${base}${pathAndQuery}`;
  if (typeof window !== "undefined") {
    return `${window.location.origin}${pathAndQuery}`;
  }
  return pathAndQuery;
}

export function PhtinQuiz() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [phtin, setPhtin] = useState<PhtinAnswer>("");
  const [birt, setBirt] = useState<BirtAnswer>("");
  const [spouse, setSpouse] = useState<SpouseAnswer>("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function advance(answer: string, field: "phtin" | "birt" | "spouse") {
    if (field === "phtin") {
      setPhtin(answer as PhtinAnswer);
      if (answer === "yes") {
        setStep(2);
      } else {
        setStep(4);
      }
    } else if (field === "birt") {
      setBirt(answer as BirtAnswer);
      setStep(3);
    } else if (field === "spouse") {
      setSpouse(answer as SpouseAnswer);
      setStep(4);
    }
  }

  async function handleFinish() {
    if (!email.trim()) return;
    setSubmitting(true);

    const classification = classify(phtin, birt, spouse);
    setResult(classification);

    try {
      const supabase = createClient();
      const variant =
        typeof document !== "undefined"
          ? document.cookie.split("; ").find((c) => c.startsWith("lp_variant="))?.split("=")[1]
          : undefined;
      const source_domain =
        typeof document !== "undefined"
          ? document.cookie.split("; ").find((c) => c.startsWith("lp_domain="))?.split("=")[1]
          : undefined;

      await supabase.from("landing_page_leads").insert({
        email: email.trim(),
        quiz_result: classification,
        variant: variant || "control",
        source_domain: source_domain || "hub",
        source_tool: "phtin_quiz",
      });
    } catch {
      // non-blocking
    }

    try {
      posthog.capture("phtin_quiz_complete", {
        result: classification,
        has_phtin: phtin,
        has_birt: birt,
        spouse_on_account: spouse,
      });
    } catch {
      // non-blocking
    }

    setSubmitting(false);
  }

  function reset() {
    setStep(0);
    setPhtin("");
    setBirt("");
    setSpouse("");
    setEmail("");
    setResult(null);
  }

  const applyUrl = getApplyUrl(`/apply/rental-license/intake?phtin=${phtin}`);
  const phtinSetupUrl = getApplyUrl(`/apply/rental-license/phtin-setup`);

  return (
    <section id="phtin-quiz" className="py-20 md:py-28 px-6" style={{ backgroundColor: "#f7f6f3" }}>
      <div className="max-w-3xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#6750a1" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              60-second readiness check
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}
          >
            Are you <span className="highlight-word">license-ready</span>?
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-12" style={{ color: "#6b6d7b" }}>
            The #1 thing that delays rental licenses isn&apos;t violations — it&apos;s tax account setup.
            Three quick questions and we&apos;ll tell you where you stand.
          </p>
        </Animate>

        <Animate delay={300}>
          <div
            className="rounded-2xl border p-6 md:p-10 bg-white"
            style={{ borderColor: "#e8e7e4" }}
          >
            {step === 0 && (
              <div className="text-center">
                <p className="mb-6 text-sm font-medium" style={{ color: "#6b6d7b" }}>
                  Takes under a minute. No phone number required.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02]"
                  style={{ backgroundColor: "#6750a1" }}
                >
                  Start the quiz
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            )}

            {step === 1 && (
              <QuizStep
                step={1}
                total={3}
                question="Do you have a Philadelphia Tax Identification Number (PHTIN)?"
                help="Different from your SSN, EIN, or OPA number — it&apos;s a separate number issued by the Philadelphia Tax Center."
                learnMoreTitle="What exactly is a PHTIN?"
                learnMore="A PHTIN is the unique tax ID Philadelphia issues to anyone earning income in the city — including landlords collecting rent. You create it online at tax-services.phila.gov in about 15 minutes. Philly <strong>will not</strong> issue a rental license without one, which is why it&apos;s the single biggest blocker for first-time landlords. If you&apos;re not sure, you probably don&apos;t have one yet — and that&apos;s completely normal."
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "not_sure", label: "Not sure" },
                ]}
                onSelect={(v) => advance(v, "phtin")}
              />
            )}

            {step === 2 && (
              <QuizStep
                step={2}
                total={3}
                question="Is your tax account registered for BIRT and NPT?"
                help="Business Income &amp; Receipts Tax (BIRT) and Net Profits Tax (NPT). If you&apos;re missing either, your application will get flagged."
                learnMoreTitle="Why does Philly require both?"
                learnMore="When you created your PHTIN, the Tax Center asked which taxes you&apos;d file. Landlords are supposed to register for <strong>both</strong> BIRT (tax on gross rental receipts) and NPT (tax on net profits). Most first-timers pick one or neither by mistake. L&amp;I will flag a missing registration when we submit your rental license — it&apos;s a quick fix, but catching it <em>after</em> submission costs you 1–2 weeks. Not sure which you&apos;re registered for? That&apos;s the most common answer — we&apos;ll check it with you."
                options={[
                  { value: "yes", label: "Yes, both" },
                  { value: "no", label: "No / only one" },
                  { value: "dont_know", label: "I don&apos;t know" },
                ]}
                onSelect={(v) => advance(v, "birt")}
              />
            )}

            {step === 3 && (
              <QuizStep
                step={3}
                total={3}
                question="If the property is jointly owned, is your spouse on the tax account?"
                help="Missing a spouse on jointly-owned properties is one of the most common issues we see."
                learnMoreTitle="Why does this matter?"
                learnMore="If the deed lists both spouses as owners, Philly requires <strong>both names</strong> on the tax account — otherwise the city considers the tax filings incomplete and bounces the rental license application. Adding a spouse is a single phone call to the Tax Center, but almost no one knows to do it until their application gets rejected. We catch this upfront so it doesn&apos;t delay you."
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "na", label: "Not jointly owned" },
                ]}
                onSelect={(v) => advance(v, "spouse")}
              />
            )}

            {step === 4 && !result && (
              <div>
                <div className="text-xs font-medium mb-2" style={{ color: "#6b6d7b" }}>
                  Final step
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "#333543" }}>
                  Where should we send your personalized next steps?
                </h3>
                <p className="text-sm mb-6" style={{ color: "#6b6d7b" }}>
                  We&apos;ll email you a tailored checklist based on your answers — no spam, ever.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="flex-1 px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#6750a1]"
                    style={{ borderColor: "#e2e3e7", color: "#333543" }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFinish();
                    }}
                  />
                  <button
                    onClick={handleFinish}
                    disabled={submitting || !email.trim()}
                    className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    style={{ backgroundColor: "#6750a1" }}
                  >
                    {submitting ? "Analyzing..." : "Get my results"}
                  </button>
                </div>
                <button
                  onClick={reset}
                  className="mt-4 text-xs underline"
                  style={{ color: "#b0b2bc" }}
                >
                  Start over
                </button>
              </div>
            )}

            {result && <QuizResult result={result} applyUrl={applyUrl} phtinSetupUrl={phtinSetupUrl} onReset={reset} />}
          </div>
        </Animate>
      </div>
    </section>
  );
}

function QuizStep({
  step,
  total,
  question,
  help,
  learnMoreTitle,
  learnMore,
  options,
  onSelect,
}: {
  step: number;
  total: number;
  question: string;
  help: string;
  learnMoreTitle?: string;
  learnMore?: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
}) {
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <div className="text-xs font-medium" style={{ color: "#6b6d7b" }}>
          Question {step} of {total}
        </div>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e3e7" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(step / total) * 100}%`, backgroundColor: "#6750a1" }}
          />
        </div>
      </div>
      <h3 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "#333543" }}>
        {question}
      </h3>
      <p
        className="text-sm"
        style={{ color: "#6b6d7b" }}
        dangerouslySetInnerHTML={{ __html: help }}
      />

      {learnMore && (
        <div className="mt-2 mb-6">
          <button
            type="button"
            onClick={() => setShowLearnMore((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: "#6750a1" }}
            aria-expanded={showLearnMore}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {showLearnMore ? "Hide explanation" : learnMoreTitle || "What is this?"}
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              maxHeight: showLearnMore ? "400px" : "0",
              opacity: showLearnMore ? 1 : 0,
            }}
          >
            <div
              className="mt-3 rounded-xl p-4 text-xs leading-relaxed"
              style={{ backgroundColor: "#f3effa", color: "#3f2e6e" }}
              dangerouslySetInnerHTML={{ __html: learnMore }}
            />
          </div>
        </div>
      )}
      {!learnMore && <div className="mb-6" />}

      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className="text-left px-5 py-4 rounded-xl border text-sm font-medium transition-all hover:border-[#6750a1] hover:shadow-sm"
            style={{ borderColor: "#e2e3e7", color: "#333543", backgroundColor: "white" }}
            dangerouslySetInnerHTML={{ __html: opt.label }}
          />
        ))}
      </div>
    </div>
  );
}

function QuizResult({
  result,
  applyUrl,
  phtinSetupUrl,
  onReset,
}: {
  result: Result;
  applyUrl: string;
  phtinSetupUrl: string;
  onReset: () => void;
}) {
  const copy = {
    ready: {
      badge: { text: "License-ready", color: "#50b8a2" },
      heading: "You&apos;re in great shape.",
      body: "Your tax account looks set. The fastest path from here is straight into the application — most license-ready owners finish in 3–5 business days.",
      ctaLabel: "Start my application — $500",
      ctaUrl: applyUrl,
      secondaryLabel: "Or talk to a human first",
      secondaryUrl: "mailto:license@hubkey.co?subject=Rental%20License%20Question",
    },
    needs_setup: {
      badge: { text: "Needs setup", color: "#f59e0b" },
      heading: "We&apos;ll handle the tax account piece with you.",
      body: "Without a complete tax account, L&amp;I will bounce your application. Good news: our Operations Manager walks owners through PHTIN setup in a 15-minute call — it&apos;s included with your service.",
      ctaLabel: "See the guided setup",
      ctaUrl: phtinSetupUrl,
      secondaryLabel: "Or start anyway — we&apos;ll help as we go",
      secondaryUrl: applyUrl,
    },
    not_sure: {
      badge: { text: "Let&apos;s figure it out", color: "#6b6d7b" },
      heading: "That&apos;s totally normal — most owners aren&apos;t sure.",
      body: "We&apos;ve walked 100+ property owners through this. We&apos;ll check your tax status for you, identify any gaps, and tell you exactly what&apos;s needed. No obligation to continue.",
      ctaLabel: "Get my free tax-account check",
      ctaUrl: phtinSetupUrl,
      secondaryLabel: "Or start my application",
      secondaryUrl: applyUrl,
    },
  }[result];

  return (
    <div>
      <div
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
        style={{ backgroundColor: copy.badge.color + "15", color: copy.badge.color }}
      >
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: copy.badge.color }} />
        {copy.badge.text}
      </div>
      <h3
        className="text-2xl md:text-3xl font-bold mb-3"
        style={{ color: "#333543" }}
        dangerouslySetInnerHTML={{ __html: copy.heading }}
      />
      <p
        className="text-base mb-8"
        style={{ color: "#6b6d7b" }}
        dangerouslySetInnerHTML={{ __html: copy.body }}
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={copy.ctaUrl}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.01]"
          style={{ backgroundColor: "#50b8a2" }}
          dangerouslySetInnerHTML={{ __html: copy.ctaLabel }}
        />
        <a
          href={copy.secondaryUrl}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all hover:border-[#50b8a2]"
          style={{ borderColor: "#e2e3e7", color: "#333543" }}
          dangerouslySetInnerHTML={{ __html: copy.secondaryLabel }}
        />
      </div>
      <button onClick={onReset} className="mt-6 text-xs underline" style={{ color: "#b0b2bc" }}>
        Retake the quiz
      </button>
    </div>
  );
}
