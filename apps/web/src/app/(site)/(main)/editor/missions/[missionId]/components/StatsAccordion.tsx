"use client";

import { EditorAccordion } from "@/app/(site)/(main)/editor/components/view/EditorAccordion";
import type { LucideIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

interface StatsAccordionProps {
  icon: LucideIcon;
  title: string;
  badge?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function StatsAccordion({
  icon: Icon,
  title,
  badge,
  defaultOpen = false,
  children,
}: StatsAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <EditorAccordion
      isOpen={isOpen}
      onToggle={() => setIsOpen(prev => !prev)}
      title={title}
      badge={badge}
      headerHeight="h-12"
      leftSlot={
        <div className="flex items-center justify-center pl-4 pr-1">
          <Icon className="size-4 text-violet-500" />
        </div>
      }
    >
      {children}
    </EditorAccordion>
  );
}
