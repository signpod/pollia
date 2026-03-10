"use client";

import { DateAndTimePicker, Toggle, Typo } from "@repo/ui/components";
import { useEffect, useState } from "react";

interface DateTimeSettingRowProps {
  label: string;
  description: string;
  value: Date | null | undefined;
  onChange: (date: Date | null) => void;
  disabled?: boolean;
}

function splitDateTime(date: Date): { date: Date; time: string } {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return { date, time: `${h}:${m}` };
}

function mergeDateTime(date: Date, time: string): Date {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const merged = new Date(date);
  merged.setHours(h, m, 0, 0);
  return merged;
}

export function DateTimeSettingRow({
  label,
  description,
  value,
  onChange,
  disabled = false,
}: DateTimeSettingRowProps) {
  const [isEnabled, setIsEnabled] = useState(value != null);
  const split = value ? splitDateTime(value) : null;

  useEffect(() => {
    if (value != null) {
      setIsEnabled(true);
    }
  }, [value]);

  const handleToggle = (checked: boolean) => {
    setIsEnabled(checked);
    if (!checked) {
      onChange(null);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    onChange(mergeDateTime(newDate, split?.time ?? "09:00"));
  };

  const handleTimeChange = (newTime: string) => {
    onChange(mergeDateTime(split?.date ?? new Date(), newTime));
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1 flex flex-col gap-1 overflow-hidden">
            <Typo.SubTitle>{label}</Typo.SubTitle>
            <Typo.Body size="medium" className="text-zinc-500">
              {description}
            </Typo.Body>
          </div>
          <div className="shrink-0">
            <Toggle checked={isEnabled} onCheckedChange={handleToggle} disabled={disabled} />
          </div>
        </div>

        {isEnabled && split && (
          <DateAndTimePicker
            date={split?.date}
            time={split?.time}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            disabled={disabled}
          />
        )}
      </div>
    </div>
  );
}
