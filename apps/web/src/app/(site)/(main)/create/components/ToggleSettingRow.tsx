"use client";

import { Badge } from "@/components/ui/badge";
import { Toggle, Typo } from "@repo/ui/components";
import type { ReactNode } from "react";

interface ToggleSettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badgeLabel?: string;
  badgeIcon?: ReactNode;
}

export function ToggleSettingRow({
  label,
  description,
  checked,
  onChange,
  badgeLabel,
  badgeIcon,
}: ToggleSettingRowProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 flex flex-col gap-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <Typo.SubTitle>{label}</Typo.SubTitle>
            {badgeLabel ? (
              <Badge
                variant="outline"
                className="border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100"
              >
                {badgeIcon}
                {badgeLabel}
              </Badge>
            ) : null}
          </div>
          <Typo.Body size="medium" className="text-zinc-500">
            {description}
          </Typo.Body>
        </div>
        <div className="shrink-0">
          <Toggle checked={checked} onCheckedChange={onChange} />
        </div>
      </div>
    </div>
  );
}
