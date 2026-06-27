"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;       // ms
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;    // ms
  threshold?: number;   // 0–1
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 650,
  threshold = 0.12,
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const hiddenTransform: Record<string, string> = {
    up: "translate3d(0,40px,0)",
    down: "translate3d(0,-40px,0)",
    left: "translate3d(40px,0,0)",
    right: "translate3d(-40px,0,0)",
    none: "translate3d(0,0,0)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : hiddenTransform[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1), transform ${duration}ms cubic-bezier(0.4,0,0.2,1)`,
        transitionDelay: `${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
