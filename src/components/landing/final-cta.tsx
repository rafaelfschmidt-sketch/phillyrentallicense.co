"use client";

import { Animate } from "./animate";

export function FinalCta() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ backgroundColor: "#333543" }}>
      <div className="max-w-3xl mx-auto text-center">
        <Animate>
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-8 text-xs font-semibold uppercase tracking-widest"
            style={{ backgroundColor: "rgba(80,184,162,0.15)", color: "#50b8a2" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Don&apos;t wait — fines start at $2,000/day
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white"
            style={{ border: "none", paddingBottom: 0, display: "block" }}>
            Get your license handled.{" "}
            <span className="highlight-word" style={{ "--highlight-color": "#50b8a2" } as React.CSSProperties}>
              Today
            </span>.
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="mt-5 text-lg leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            100+ Philadelphia landlords trust HubKey to handle their rental license —
            from compliance checks to L&I submission. Fast, compliant, done.
          </p>
        </Animate>

        <Animate delay={300}>
          <div className="mt-10 inline-flex items-center gap-3 rounded-2xl border px-6 py-5"
            style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}>
            <svg className="w-6 h-6 shrink-0" style={{ color: "#50b8a2" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-left" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="font-semibold text-white">Our guarantee:</span>{" "}
              If we can&apos;t get your license approved, you don&apos;t pay our service fee.
            </span>
          </div>
        </Animate>

        <Animate delay={400}>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => document.getElementById("address-checker")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: "#50b8a2" }}
            >
              Check Your Property
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              View Pricing
            </button>
          </div>
        </Animate>

        <Animate delay={500}>
          <p className="mt-8 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            Free compliance preview · No commitment · No spam
          </p>
        </Animate>
      </div>
    </section>
  );
}
