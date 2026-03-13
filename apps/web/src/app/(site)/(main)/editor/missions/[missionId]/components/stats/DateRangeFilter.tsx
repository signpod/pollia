"use client";

import type { DateRangeString } from "@/types/common/dateRange";
import { useCallback, useMemo } from "react";

interface DateRangeFilterProps {
  value: DateRangeString | undefined;
  onChange: (value: DateRangeString | undefined) => void;
}

type PresetKey = "today" | "7d" | "30d" | "all";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "today", label: "오늘" },
  { key: "7d", label: "7일" },
  { key: "30d", label: "30일" },
  { key: "all", label: "전체" },
];

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getPresetRange(key: PresetKey): DateRangeString | undefined {
  if (key === "all") return undefined;

  const now = new Date();
  const to = toDateString(now);

  if (key === "today") {
    return { from: to, to };
  }

  const days = key === "7d" ? 7 : 30;
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  return { from: toDateString(from), to };
}

function getActivePreset(value: DateRangeString | undefined): PresetKey | null {
  if (!value) return "all";

  for (const preset of PRESETS) {
    if (preset.key === "all") continue;
    const range = getPresetRange(preset.key);
    if (range && range.from === value.from && range.to === value.to) {
      return preset.key;
    }
  }
  return null;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const activePreset = useMemo(() => getActivePreset(value), [value]);

  const handlePreset = useCallback(
    (key: PresetKey) => {
      onChange(getPresetRange(key));
    },
    [onChange],
  );

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const from = e.target.value;
      if (!from) return;
      const to = value?.to ?? toDateString(new Date());
      onChange({ from, to });
    },
    [onChange, value?.to],
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const to = e.target.value;
      if (!to) return;
      const from = value?.from ?? to;
      onChange({ from, to });
    },
    [onChange, value?.from],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex gap-1">
        {PRESETS.map(preset => (
          <button
            key={preset.key}
            type="button"
            onClick={() => handlePreset(preset.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activePreset === preset.key
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 text-sm text-zinc-600">
        <input
          type="date"
          value={value?.from ?? ""}
          onChange={handleFromChange}
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-zinc-400"
        />
        <span className="text-zinc-400">~</span>
        <input
          type="date"
          value={value?.to ?? ""}
          onChange={handleToChange}
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 outline-none focus:border-zinc-400"
        />
      </div>
    </div>
  );
}
