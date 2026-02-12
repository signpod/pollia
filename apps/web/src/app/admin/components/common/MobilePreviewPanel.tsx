"use client";

import type { ReactNode } from "react";
import { type RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MobilePreviewPanelProps {
  anchor: RefObject<HTMLElement | null>;
  url?: string;
  children?: ReactNode;
}

const DEVICE_SIZE = { width: 393, height: 852 };

export function MobilePreviewPanel({ anchor, url, children }: MobilePreviewPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !anchor.current) return null;

  return createPortal(
    <div className="flex flex-col items-center">
      <div
        className="relative bg-zinc-900 rounded-[40px] p-3 shadow-2xl"
        style={{
          width: DEVICE_SIZE.width + 24,
          height: DEVICE_SIZE.height + 24,
        }}
      >
        <div
          className="relative flex flex-col bg-white rounded-[28px] overflow-hidden"
          style={{
            width: DEVICE_SIZE.width,
            height: DEVICE_SIZE.height,
            transform: "translateZ(0)",
          }}
        >
          {url ? (
            <iframe
              title="미션 미리보기"
              src={url}
              className="w-full h-full border-0 overflow-y-scroll"
            />
          ) : (
            <div className="h-full overflow-y-auto">{children}</div>
          )}
        </div>
      </div>
    </div>,
    anchor.current,
  );
}
