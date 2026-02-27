"use client";

import { consumeSnapshot, getIsBackNavigation } from "@/hooks/common/useNavigationDirection";
import { useEffect, useRef } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: "tab" | "stack";
}

export function PageTransition({ children, variant = "tab" }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isBack = variant === "stack" ? getIsBackNavigation() : false;
  const isSlideIn = variant === "stack" && !isBack;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clearInlineStyles = () => {
      el.style.opacity = "";
      el.style.transform = "";
      el.style.position = "";
      el.style.zIndex = "";
      el.style.background = "";
      el.style.minHeight = "";
    };

    if (isSlideIn) {
      const snapshot = consumeSnapshot();
      if (snapshot) {
        document.body.appendChild(snapshot);
        const removeSnapshot = () => snapshot.remove();
        el.addEventListener(
          "animationend",
          () => {
            removeSnapshot();
            clearInlineStyles();
          },
          { once: true },
        );
        const timer = setTimeout(() => {
          removeSnapshot();
          clearInlineStyles();
        }, 400);
        return () => {
          clearTimeout(timer);
          removeSnapshot();
        };
      }
    }

    el.addEventListener("animationend", clearInlineStyles, { once: true });
    const timer = setTimeout(clearInlineStyles, 400);
    return () => clearTimeout(timer);
  }, [isSlideIn]);

  if (isSlideIn) {
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

  return (
    <div ref={ref} data-page-transition className="animate-page-fade" style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
