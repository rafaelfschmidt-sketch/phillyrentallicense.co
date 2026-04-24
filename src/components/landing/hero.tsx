"use client";

import { Animate } from "./animate";

interface HeroProps {
  variant?: "control" | "v1" | "v2";
}

const VARIANT_COPY: Record<string, { pill: string; headlinePre: string; highlight: string; headlinePost: string; subtitle: string }> = {
  control: {
    pill: "Philadelphia Rental Licenses",
    headlinePre: "One service to ",
    highlight: "handle",
    headlinePost: " your rental license",
    subtitle:
      "We check 5 city databases, coordinate lead paint testing, set up your tax accounts, and submit everything to L&I. You fill out one form — we do the rest.",
  },
  v1: {
    pill: "Philadelphia Rental Licenses",
    headlinePre: "Get your rental license in ",
    highlight: "3–5 days",
    headlinePost: ".",
    subtitle:
      "Skip weeks of phone calls, tax-portal logins, and L&I paperwork. We handle the whole process end-to-end — most owners are licensed in under a week.",
  },
  v2: {
    pill: "Philadelphia Rental Licenses",
    headlinePre: "Don't risk ",
    highlight: "$2,000/day",
    headlinePost: " in unlicensed-rental fines.",
    subtitle:
      "Philly fines unlicensed rentals up to $2,000/day, and rent collected without a license isn't legally recoverable. We get you compliant in 3–5 days — flat fee, no surprises.",
  },
};

export function Hero({ variant = "control" }: HeroProps) {
  const copy = VARIANT_COPY[variant] || VARIANT_COPY.control;
  return (
    <section className="relative overflow-hidden pt-16 pb-12 md:pt-24 md:pb-16 px-6" style={{ backgroundColor: "#f7f6f3" }}>
      {/* Floating decorative elements */}
      <div className="absolute top-20 left-[10%] w-12 h-12 rounded-full bg-[#50b8a2]/10 float-animation hidden md:block" />
      <div className="absolute top-32 right-[12%] w-8 h-8 rounded-full bg-[#6750a1]/10 float-animation-delayed hidden md:block" />
      <div className="absolute bottom-24 left-[15%] w-6 h-6 rounded-full bg-[#50b8a2]/15 float-animation-slow hidden md:block" />
      <div className="absolute bottom-32 right-[18%] w-10 h-10 rounded-full bg-[#6750a1]/8 float-animation hidden md:block" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Category pill */}
        <Animate delay={0}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-8"
            style={{ backgroundColor: "#50b8a2", color: "#fff" }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {copy.pill}
          </div>
        </Animate>

        {/* Headline */}
        <Animate delay={100}>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}
          >
            {copy.headlinePre}
            <span className="highlight-word">{copy.highlight}</span>
            {copy.headlinePost}
          </h1>
        </Animate>

        {/* Subtitle */}
        <Animate delay={200}>
          <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "#6b6d7b" }}>
            {copy.subtitle}
          </p>
        </Animate>

        {/* CTAs */}
        <Animate delay={300}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/apply/rental-license/intake?service=license_only"
              className="inline-flex items-center px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: "#50b8a2" }}
            >
              Start My Application
            </a>
            <button
              onClick={() => document.getElementById("address-tool")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold border-2 transition-all duration-200 hover:bg-white cursor-pointer"
              style={{ color: "#50b8a2", borderColor: "#50b8a2" }}
            >
              Check Your Property Free
            </button>
          </div>
          <div className="mt-4 text-sm" style={{ color: "#6b6d7b" }}>
            <span className="font-semibold" style={{ color: "#333543" }}>$500 flat</span>
            <span className="mx-2">·</span>
            <span>City fees at cost</span>
            <span className="mx-2">·</span>
            <span>No-approval, no-pay guarantee</span>
          </div>
          <div className="mt-3">
            <button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="text-sm underline-offset-4 hover:underline"
              style={{ color: "#6b6d7b" }}
            >
              Not sure yet? See how it works ↓
            </button>
          </div>
        </Animate>

        {/* Trust stats */}
        <Animate delay={400}>
          <div className="mt-16 pt-8 border-t" style={{ borderColor: "#e2e3e7" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-6" style={{ color: "#6b6d7b" }}>
              Trusted by Philadelphia property owners
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#333543" }}>100+</div>
                <div className="text-xs" style={{ color: "#6b6d7b" }}>Licenses processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#333543" }}>3–5 days</div>
                <div className="text-xs" style={{ color: "#6b6d7b" }}>Average turnaround</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#333543" }}>5</div>
                <div className="text-xs" style={{ color: "#6b6d7b" }}>City databases checked</div>
              </div>
            </div>
          </div>
        </Animate>
      </div>
    </section>
  );
}
