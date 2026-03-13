"use client";

import type { DateRangeString } from "@/types/common/dateRange";
import {
  Button,
  Calendar,
  DrawerContent,
  DrawerProvider,
  Typo,
  useDrawer,
} from "@repo/ui/components";
import { CalendarDays } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ko } from "react-day-picker/locale";

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

function parseDate(dateStr: string): Date {
  const [y = 0, m = 1, d = 1] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${y}.${m}.${d}`;
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

function DatePickerTrigger({ label, dateStr }: { label: string; dateStr: string | undefined }) {
  const { open } = useDrawer();

  return (
    <button
      type="button"
      onClick={open}
      className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm text-zinc-700 transition-colors hover:border-zinc-400"
    >
      <CalendarDays className="size-4 text-zinc-400" />
      <span>{dateStr ? formatDisplayDate(dateStr) : label}</span>
    </button>
  );
}

function SingleCalendarDrawer({
  title,
  initialDate,
  onConfirm,
}: {
  title: string;
  initialDate: Date | undefined;
  onConfirm: (date: Date) => void;
}) {
  const { close } = useDrawer();
  const [selected, setSelected] = useState<Date | undefined>(initialDate);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
    }
    close();
  };

  return (
    <>
      <Typo.SubTitle className="mb-2">{title}</Typo.SubTitle>
      <Calendar
        mode="single"
        locale={ko}
        selected={selected}
        onSelect={setSelected}
        captionLayout="dropdown"
        className="w-full"
      />
      <Button className="mt-6 w-full" onClick={handleConfirm}>
        확인
      </Button>
    </>
  );
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
    (date: Date) => {
      const from = toDateString(date);
      const to = value?.to ?? from;
      onChange({ from, to: from > to ? from : to });
    },
    [onChange, value?.to],
  );

  const handleToChange = useCallback(
    (date: Date) => {
      const to = toDateString(date);
      const from = value?.from ?? to;
      onChange({ from: to < from ? to : from, to });
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

      <div className="flex items-center gap-1.5">
        <DrawerProvider>
          <DatePickerTrigger label="시작일" dateStr={value?.from} />
          <DrawerContent className="p-5 pb-10">
            <SingleCalendarDrawer
              title="시작일 선택"
              initialDate={value?.from ? parseDate(value.from) : undefined}
              onConfirm={handleFromChange}
            />
          </DrawerContent>
        </DrawerProvider>

        <span className="text-sm text-zinc-400">~</span>

        <DrawerProvider>
          <DatePickerTrigger label="종료일" dateStr={value?.to} />
          <DrawerContent className="p-5 pb-10">
            <SingleCalendarDrawer
              title="종료일 선택"
              initialDate={value?.to ? parseDate(value.to) : undefined}
              onConfirm={handleToChange}
            />
          </DrawerContent>
        </DrawerProvider>
      </div>
    </div>
  );
}
