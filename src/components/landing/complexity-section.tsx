"use client";

import { Animate } from "./animate";

const features = [
  {
    title: "Automated compliance checks",
    description:
      "We scan 5 Philadelphia city databases instantly — violations, licenses, ownership, lead certs, and CAL status. No more bouncing between Atlas, OPA, and L&I websites.",
    preview: (
      <div className="rounded-xl border p-5" style={{ backgroundColor: "#fff", borderColor: "#e2e3e7" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#50b8a2]" />
          <span className="text-xs font-semibold" style={{ color: "#333543" }}>Compliance Report</span>
        </div>
        <div className="space-y-2.5">
          {[
            { name: "Rental License", status: "Active", color: "#22c55e" },
            { name: "Open Violations", status: "None", color: "#22c55e" },
            { name: "Lead Certification", status: "Required", color: "#f59e0b" },
            { name: "CAL Status", status: "Active", color: "#22c55e" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg" style={{ backgroundColor: "#f8f8fa" }}>
              <span style={{ color: "#6b6d7b" }}>{item.name}</span>
              <span className="flex items-center gap-1.5 font-medium" style={{ color: item.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.status}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: "#6b6d7b" }}>Readiness Score</span>
          <span className="text-sm font-bold" style={{ color: "#50b8a2" }}>85%</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#e2e3e7" }}>
          <div className="h-full rounded-full" style={{ width: "85%", backgroundColor: "#50b8a2" }} />
        </div>
      </div>
    ),
  },
  {
    title: "Real-time status tracking",
    description: "Know exactly where your application stands at every step — from PHTIN verification to license issuance.",
    preview: (
      <div className="space-y-2.5 mt-3">
        {[
          { step: "Intake Complete", done: true },
          { step: "PHTIN Verified", done: true },
          { step: "Lead Paint Test", done: true },
          { step: "Eclipse Submission", active: true },
          { step: "License Issued", done: false },
        ].map((s) => (
          <div key={s.step} className="flex items-center gap-2.5 text-xs">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-[#50b8a2]" : s.active ? "border-2 border-[#50b8a2]" : "border-2"}`}
              style={!s.done && !s.active ? { borderColor: "#d0d1d8" } : {}}>
              {s.done && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {s.active && <div className="w-2 h-2 rounded-full bg-[#50b8a2]" />}
            </div>
            <span style={{ color: s.done ? "#333543" : s.active ? "#50b8a2" : "#6b6d7b" }}
              className={s.active ? "font-semibold" : ""}>
              {s.step}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "PHTIN setup guidance",
    description: "The #1 blocker for rental licenses. We walk you through Philadelphia Tax Center setup step by step.",
    preview: (
      <div className="mt-3 space-y-2">
        <div className="rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
          Tax account created
        </div>
        <div className="rounded-lg px-3 py-2.5 text-xs" style={{ backgroundColor: "#f0fdf4", color: "#16a34a" }}>
          BIRT + NPT registered
        </div>
        <div className="rounded-lg px-3 py-2.5 text-xs font-medium" style={{ backgroundColor: "#fffbeb", color: "#d97706" }}>
          Waiting on tax clearance...
        </div>
      </div>
    ),
  },
];

export function ComplexitySection() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ backgroundColor: "#f7f6f3" }}>
      <div className="max-w-5xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
              </svg>
              Features
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Everything you need to get
            <br className="hidden sm:block" />
            your license — <span className="highlight-word">handled</span>
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-2xl mx-auto mb-16" style={{ color: "#6b6d7b" }}>
            We replace 12+ hours of navigating city websites, tax portals, and
            government offices with a single, guided process.
          </p>
        </Animate>

        {/* Bento grid */}
        <div className="space-y-5">
          {/* Large feature card */}
          <Animate delay={100}>
            <div className="rounded-2xl border p-8 md:p-10 bg-white" style={{ borderColor: "#e8e7e4" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: "#333543" }}>
                    {features[0].title}
                  </h3>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b6d7b" }}>
                    {features[0].description}
                  </p>
                  <button onClick={() => document.getElementById("address-checker")?.scrollIntoView({ behavior: "smooth" })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white cursor-pointer"
                    style={{ backgroundColor: "#50b8a2" }}>
                    Try it free
                  </button>
                </div>
                <div>{features[0].preview}</div>
              </div>
            </div>
          </Animate>

          {/* Two smaller cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {features.slice(1).map((f, i) => (
              <Animate key={f.title} delay={200 + i * 100}>
                <div className="rounded-2xl border p-8 bg-white h-full" style={{ borderColor: "#e8e7e4" }}>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#333543" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6b6d7b" }}>
                    {f.description}
                  </p>
                  {f.preview}
                </div>
              </Animate>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
