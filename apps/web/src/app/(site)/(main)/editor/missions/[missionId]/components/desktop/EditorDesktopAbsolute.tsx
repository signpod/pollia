"use client";

import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface EditorDesktopAbsoluteProps {
  side: "left" | "right";
  topOffset?: number;
  panelWidth?: number;
  gap?: number;
  zIndex?: number;
  children: ReactNode;
}

const DESKTOP_MIN_WIDTH = 1280;
const MAIN_COLUMN_WIDTH = 600;

export function EditorDesktopAbsolute({
  side,
  topOffset = 72,
  panelWidth = 320,
  gap = 20,
  zIndex = 30,
  children,
}: EditorDesktopAbsoluteProps) {
  const [mounted, setMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    setMounted(true);

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const style = useMemo<CSSProperties>(() => {
    const baseHalfWidth = MAIN_COLUMN_WIDTH / 2;
    const leftPosition =
      side === "left"
        ? `max(16px, calc(50vw - ${baseHalfWidth}px - ${gap}px - ${panelWidth}px))`
        : `min(calc(100vw - ${panelWidth + 16}px), calc(50vw + ${baseHalfWidth + gap}px))`;

    return {
      top: topOffset,
      left: leftPosition,
      width: panelWidth,
      height: `calc(100vh - ${topOffset + 16}px)`,
      maxHeight: `calc(100vh - ${topOffset + 16}px)`,
      overflow: "hidden",
      zIndex,
    };
  }, [gap, panelWidth, side, topOffset, zIndex]);

  if (!mounted || viewportWidth < DESKTOP_MIN_WIDTH) {
    return null;
  }

  return createPortal(
    <div
      data-testid="editor-desktop-absolute"
      data-side={side}
      className="pointer-events-none fixed"
      style={style}
    >
      <div className="pointer-events-auto h-full">{children}</div>
    </div>,
    document.body,
  );
}
