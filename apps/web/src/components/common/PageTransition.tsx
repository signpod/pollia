"use client";

import { consumeSnapshot, getIsBackNavigation } from "@/hooks/common/useNavigationDirection";
import { useEffect, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: "tab" | "stack";
}

export function PageTransition({ children, variant = "tab" }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant !== "stack") return;

    const snapshot = consumeSnapshot();
    if (!snapshot) return;

    document.body.appendChild(snapshot);

    const cleanup = () => snapshot.remove();
    ref.current?.addEventListener("animationend", cleanup, { once: true });
    const timer = setTimeout(cleanup, 400);

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [variant]);

  if (variant === "tab") {
    return (
      <div data-page-transition className="animate-page-fade" style={{ opacity: 0 }}>
        {children}
      </div>
    );
  }

  const isBack = getIsBackNavigation();

  if (isBack) {
    return (
      <div data-page-transition className="animate-page-fade" style={{ opacity: 0 }}>
        {children}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-page-transition
      className="animate-page-slide-in"
      style={{
        transform: "translate3d(100%, 0, 0)",
        position: "relative",
        zIndex: 51,
        background: "var(--color-background, white)",
        minHeight: "100dvh",
      }}
    >
      {children}
    </div>
  );
}
