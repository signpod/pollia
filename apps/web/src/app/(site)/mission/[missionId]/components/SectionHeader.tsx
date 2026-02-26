"use client";

import { Typo } from "@repo/ui/components";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex flex-col">
      <Typo.MainTitle size="small">{title}</Typo.MainTitle>
      {subtitle && (
        <Typo.Body size="large" className="text-info">
          {subtitle}
        </Typo.Body>
      )}
    </div>
  );
}
