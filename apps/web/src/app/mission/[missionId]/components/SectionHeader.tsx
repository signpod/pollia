"use client";

import { Typo } from "@repo/ui/components";

interface SectionHeaderProps {
  badgeText: string;
  title?: string | React.ReactNode;
}

export function SectionHeader({ badgeText, title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="bg-zinc-700 rounded-full px-3 py-1">
        <Typo.SubTitle size="large" className="text-white">
          {badgeText}
        </Typo.SubTitle>
      </div>
      {title && <Typo.MainTitle size="medium">{title}</Typo.MainTitle>}
    </div>
  );
}
