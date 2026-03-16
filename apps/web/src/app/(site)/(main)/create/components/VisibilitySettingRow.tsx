"use client";

import { MISSION_VISIBILITY_OPTIONS, type MissionVisibility } from "@/constants/mission";
import { Typo } from "@repo/ui/components";
import { Globe, Link, Lock } from "lucide-react";

interface VisibilitySettingRowProps {
  value: MissionVisibility;
  onChange: (value: MissionVisibility) => void;
}

const VISIBILITY_ICONS: Record<MissionVisibility, React.ReactNode> = {
  PUBLIC: <Globe className="size-4" />,
  LINK_ONLY: <Link className="size-4" />,
  PRIVATE: <Lock className="size-4" />,
};

const VISIBILITY_DESCRIPTIONS: Record<MissionVisibility, string> = {
  PUBLIC: "피드에 노출됩니다.",
  LINK_ONLY: "링크로만 접근할 수 있습니다.",
  PRIVATE: "나만 볼 수 있으며 발행할 수 없습니다.",
};

export function VisibilitySettingRow({ value, onChange }: VisibilitySettingRowProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Typo.SubTitle>공개 범위</Typo.SubTitle>
          <Typo.Body size="medium" className="text-zinc-500">
            {VISIBILITY_DESCRIPTIONS[value]}
          </Typo.Body>
        </div>
        <div className="flex gap-2">
          {MISSION_VISIBILITY_OPTIONS.map(option => {
            const isSelected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {VISIBILITY_ICONS[option.value]}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
