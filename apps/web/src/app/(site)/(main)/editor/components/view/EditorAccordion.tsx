"use client";

import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface EditorAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  previewImage?: { src: string; alt: string } | null;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  children: ReactNode;
  className?: string;
  headerHeight?: string;
}

export function EditorAccordion({
  isOpen,
  onToggle,
  title,
  subtitle,
  badge,
  previewImage,
  leftSlot,
  rightSlot,
  children,
  className = "",
  headerHeight = "h-[88px]",
}: EditorAccordionProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-zinc-200 transition-shadow duration-500 ${className}`}
    >
      <div
        className={`flex ${headerHeight} cursor-pointer items-stretch bg-zinc-50`}
        onClick={onToggle}
      >
        {leftSlot ? (
          <div className="flex items-stretch" onClick={e => e.stopPropagation()}>
            {leftSlot}
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left">
          <div className="min-w-0 overflow-hidden">
            <div className="flex min-w-0 items-center gap-2">
              <span className="min-w-0 truncate text-sm font-semibold text-zinc-800">{title}</span>
              {badge ? <span className="shrink-0">{badge}</span> : null}
            </div>
            {subtitle ? (
              <span className="mt-1 block truncate text-xs text-zinc-500">{subtitle}</span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {previewImage ? (
              <img
                src={previewImage.src}
                alt={previewImage.alt}
                className="size-10 shrink-0 rounded border border-zinc-200 bg-zinc-100 object-cover"
              />
            ) : null}
            <ChevronDown
              className={`size-5 shrink-0 text-zinc-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {rightSlot ? (
          <div className="flex items-stretch" onClick={e => e.stopPropagation()}>
            {rightSlot}
          </div>
        ) : null}
      </div>

      <div className={isOpen ? "block border-t border-zinc-200" : "hidden"}>{children}</div>
    </div>
  );
}
