"use client";

import { Input, LabelText, Typo } from "@repo/ui/components";

interface TimeLimitSettingRowProps {
  label: string;
  description: string;
  value: number | null;
  onChange: (value: number | null) => void;
}

export function TimeLimitSettingRow({
  label,
  description,
  value,
  onChange,
}: TimeLimitSettingRowProps) {
  const isEnabled = value !== null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <LabelText required={false}>{label}</LabelText>
          <Typo.Body size="medium" className="text-left text-zinc-400">
            {description}
          </Typo.Body>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="미설정"
            value={isEnabled ? value.toString() : ""}
            onChange={e => {
              const raw = e.target.value;
              if (raw === "") {
                onChange(null);
                return;
              }
              const parsed = Number.parseInt(raw, 10);
              if (!Number.isNaN(parsed) && parsed > 0) {
                onChange(parsed);
              }
            }}
            containerClassName="flex-1"
            showLength={false}
          />
          <Typo.Body size="medium" className="shrink-0 text-zinc-400">
            초
          </Typo.Body>
        </div>
      </div>
    </div>
  );
}
