"use client";

import { Animate } from "./animate";

const steps = [
  {
    number: "01",
    title: "Enter your address",
    description: "Type in your property address. We instantly check city records to show what's needed for your license.",
  },
  {
    number: "02",
    title: "We handle everything",
    description: "Our team coordinates lead paint testing, verifies tax accounts, confirms your CAL, and submits to L&I.",
  },
  {
    number: "03",
    title: "Get your license",
    description: "Track your application in real time. Once approved, you're fully licensed — typically within 3–5 business days.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <Animate>
          <div className="text-center mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#50b8a2" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              How it works
            </span>
          </div>
        </Animate>

        <Animate delay={100}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center tracking-tight leading-tight mb-4"
            style={{ color: "#333543", border: "none", paddingBottom: 0, display: "block" }}>
            Three steps. That&apos;s <span className="highlight-word">it</span>.
          </h2>
        </Animate>

        <Animate delay={200}>
          <p className="text-center text-lg max-w-xl mx-auto mb-16" style={{ color: "#6b6d7b" }}>
            No phone calls to the city. No confusing tax portals. No guesswork.
          </p>
        </Animate>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Animate key={step.number} delay={100 + i * 150}>
              <div className="text-center">
                <div className="text-5xl font-extrabold mb-4" style={{ color: "#50b8a2", opacity: 0.25 }}>
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: "#333543" }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "#6b6d7b" }}>
                  {step.description}
                </p>
              </div>
            </Animate>
          ))}
        </div>
      </div>
    </section>
  );
}
