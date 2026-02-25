"use client";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobilePreview } from "./MobilePreview";

const DEFAULT_X = 24;
const DEFAULT_Y = 100;

export function FloatingMobilePreview() {
  const [position, setPosition] = useState({ x: DEFAULT_X, y: DEFAULT_Y });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-drag-handle]")) {
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      }
    },
    [position],
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: PointerEvent) => {
      setPosition(_prev => ({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      }));
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging]);

  if (!mounted) return null;

  return (
    <div
      className={cn("fixed z-40 hidden xl:block", isDragging && "cursor-grabbing")}
      style={{ left: position.x, top: position.y }}
      onPointerDown={handlePointerDown}
    >
      <div
        data-drag-handle
        className="flex cursor-grab items-center justify-center rounded-t-lg bg-zinc-100 py-1.5 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-zinc-500" />
      </div>
      <div className="rounded-b-2xl bg-white shadow-xl">
        <MobilePreview />
      </div>
    </div>
  );
}
