"use client";

import { CounterInput, LabelText, Typo } from "@repo/ui/components";

interface CounterSettingRowProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function CounterSettingRow({
  label,
  description,
  value,
  onChange,
  min,
  max,
  step,
}: CounterSettingRowProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 flex flex-col gap-1 overflow-hidden">
          <LabelText required={false}>{label}</LabelText>
          <Typo.Body size="medium" className="text-left text-zinc-400">
            {description}
          </Typo.Body>
        </div>
        <div className="shrink-0">
          <CounterInput value={value} onChange={onChange} min={min} max={max} step={step} />
        </div>
      </div>
    </div>
  );
}
