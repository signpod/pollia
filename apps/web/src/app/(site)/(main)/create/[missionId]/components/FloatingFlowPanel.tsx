"use client";

import { cn } from "@/lib/utils";
import { ButtonV2 } from "@repo/ui/components";
import { ReactFlowProvider } from "@xyflow/react";
import { Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EditorFlowGraph } from "./EditorFlowGraph";
import { FlowModal } from "./FlowModal";

export function FloatingFlowPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [size] = useState({ w: 280, h: 320 });
  const [position, setPosition] = useState({ x: 0, y: 80 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      setPosition(prev => ({ ...prev, x: window.innerWidth - 320 }));
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed z-40 hidden flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl 2xl:flex",
        )}
        style={{
          left: position.x,
          top: position.y,
          width: size.w,
          height: size.h,
        }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 px-2 py-1.5">
          <span className="text-xs font-medium text-zinc-600">플로우</span>
          <ButtonV2
            variant="tertiary"
            size="medium"
            className="h-7 w-7 p-0"
            onClick={() => setIsOpen(true)}
            aria-label="크게 보기"
          >
            <Maximize2 className="h-4 w-4" />
          </ButtonV2>
        </div>
        <div className="flex-1 min-h-0">
          <ReactFlowProvider>
            <EditorFlowGraph />
          </ReactFlowProvider>
        </div>
      </div>
      <FlowModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
