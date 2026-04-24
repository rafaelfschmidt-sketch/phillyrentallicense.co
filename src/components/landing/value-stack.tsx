"use client";

import { Animate } from "./animate";

const valueItems = [
  { name: "Full city compliance check (5 databases)", value: "$150" },
  { name: "PHTIN setup guidance & troubleshooting", value: "$200" },
  { name: "Tax clearance verification", value: "$100" },
  { name: "Commercial Activity License verification", value: "$100" },
  { name: "RLSI form prep & filing", value: "$150" },
  { name: "Eclipse L&I submission", value: "$200" },
  { name: "Real-time status portal", value: "$200" },
  { name: "Direct line to your coordinator", value: "$100" },
];

export function ValueStack() {
  return (
    <section className="py-20 md:py-28 px-6" style={{ backgroundColor: "#f7f6f3" }}>
      <div className="max-w-3xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              What you get
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            $1,200+ in value.
            <br />
            <span className="highlight-word">$500</span> flat.
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-12" style={{ color: "#6b6d7b" }}>
            Here&apos;s what it would cost to piece this together yourself.
          </p>
        </Animate>

        <Animate delay={300}>
          <div className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#e8e7e4" }}>
            {valueItems.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: i < valueItems.length - 1 ? "1px solid #f0efec" : "none" }}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#50b8a2] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: "#333543" }}>
                    {item.name}
                  </span>
                </div>
                <span className="text-sm line-through shrink-0 ml-4" style={{ color: "#b0b2bc" }}>
                  {item.value}
                </span>
              </div>
            ))}

            {/* Total */}
            <div className="px-6 py-6 text-center" style={{ backgroundColor: "#f7f6f3" }}>
              <div className="text-sm mb-1" style={{ color: "#6b6d7b" }}>
                Total value: <span className="line-through">$1,200+</span>
              </div>
              <div className="text-4xl font-extrabold" style={{ color: "#50b8a2" }}>
                $500
              </div>
              <div className="text-xs mt-1" style={{ color: "#6b6d7b" }}>
                City fees calculated based on your property.
              </div>
            </div>
          </div>
        </Animate>

        <Animate delay={400}>
          <div className="mt-10 text-center">
            <a
              href="/apply/rental-license/intake?service=license_only"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
              style={{ backgroundColor: "#50b8a2" }}
            >
              Get Started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </Animate>
      </div>
    </section>
  );
}
