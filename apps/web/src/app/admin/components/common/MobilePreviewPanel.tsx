"use client";

import { FixedBottomLayout } from "@repo/ui/components";
import { type ReactNode, type RefObject, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MobilePreviewPanelProps {
  children: ReactNode;
  anchor: RefObject<HTMLElement | null>;
}

const DEVICE_SIZE = { width: 393, height: 852 };

export function MobilePreviewPanel({ children, anchor }: MobilePreviewPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !anchor.current) return null;

  return createPortal(
    <div className="flex flex-col items-center">
      <div
        className="relative bg-zinc-900 rounded-[50px] p-3 shadow-2xl"
        style={{ width: DEVICE_SIZE.width + 24, height: DEVICE_SIZE.height + 24 }}
      >
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[100px] h-[32px] bg-black rounded-full z-10" />
        <div
          className="bg-white rounded-[38px] overflow-hidden"
          style={{
            width: DEVICE_SIZE.width,
            height: DEVICE_SIZE.height,
            transform: "translateZ(0)",
          }}
        >
          <FixedBottomLayout className="flex flex-col min-h-full w-full" hasGradient>
            <div
              className="w-full flex justify-center flex-1 overflow-y-auto [&_.min-h-svh]:min-h-full"
              style={{ paddingTop: 47 }}
            >
              {children}
            </div>
          </FixedBottomLayout>
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-zinc-600 rounded-full" />
      </div>
    </div>,
    anchor.current,
  );
}
