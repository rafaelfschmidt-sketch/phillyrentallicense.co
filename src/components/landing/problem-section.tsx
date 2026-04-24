"use client";

import { Animate } from "./animate";

export function ProblemSection() {
  return (
    <section className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Why it matters
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Operating without a license?
            <br className="hidden sm:block" />
            The city <span className="highlight-word">will</span> find out.
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-2xl mx-auto mb-16" style={{ color: "#6b6d7b" }}>
            Philadelphia actively enforces rental license requirements.
            Here&apos;s what&apos;s at stake.
          </p>
        </Animate>

        {/* Bento-style cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Animate delay={100}>
            <div className="rounded-2xl p-8 h-full" style={{ backgroundColor: "#fef8f8" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#fee2e2" }}>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#333543" }}>$2,000/day in fines</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b6d7b" }}>
                The city can assess daily fines for every day you operate a rental property without a valid license.
              </p>
            </div>
          </Animate>

          <Animate delay={200}>
            <div className="rounded-2xl p-8 h-full" style={{ backgroundColor: "#fef8f8" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#fee2e2" }}>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#333543" }}>Can&apos;t collect rent</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b6d7b" }}>
                Without a valid license, you have no legal standing to collect rent or enforce lease terms in Philadelphia courts.
              </p>
            </div>
          </Animate>

          <Animate delay={300}>
            <div className="rounded-2xl p-8 h-full" style={{ backgroundColor: "#fef8f8" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "#fee2e2" }}>
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "#333543" }}>Tenant legal action</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6b6d7b" }}>
                Tenants can withhold rent, file complaints, and take legal action against unlicensed landlords. Protect yourself.
              </p>
            </div>
          </Animate>
        </div>
      </div>
    </section>
  );
}
