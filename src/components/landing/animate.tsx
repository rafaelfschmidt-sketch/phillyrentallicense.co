"use client";

import { useInView } from "./use-in-view";

interface AnimateProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay in ms
  animation?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
}

export function Animate({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: AnimateProps) {
  const { ref, inView } = useInView();

  const baseStyle: React.CSSProperties = {
    transitionDelay: `${delay}ms`,
  };

  return (
    <div
      ref={ref}
      className={`landing-animate ${animation} ${inView ? "in-view" : ""} ${className}`}
      style={baseStyle}
    >
      {children}
    </div>
  );
}
