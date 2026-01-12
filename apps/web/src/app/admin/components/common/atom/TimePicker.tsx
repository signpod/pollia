"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/admin/components/shadcn-ui/select";
import { cn } from "@/app/admin/lib/utils";
import { Clock } from "lucide-react";
import { useMemo } from "react";

interface TimePickerProps {
  value?: string;
  onChange: (time: string | undefined) => void;
  disabled?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

const TIME_UNIT_LABELS = {
  hour: "시",
  minute: "분",
} as const;

function generateMinutes(step: number): string[] {
  const minutes: string[] = [];
  for (let i = 0; i < 60; i += step) {
    minutes.push(String(i).padStart(2, "0"));
  }
  return minutes;
}

function parseTime(value?: string): { hour: string; minute: string } {
  if (!value) {
    return { hour: "", minute: "" };
  }
  const [hour = "", minute = ""] = value.split(":");
  return { hour, minute };
}

export function TimePicker({
  value,
  onChange,
  disabled = false,
  minuteStep = 5,
  className,
}: TimePickerProps) {
  const { hour, minute } = parseTime(value);
  const minutes = useMemo(() => generateMinutes(minuteStep), [minuteStep]);

  const handleHourChange = (newHour: string) => {
    const newMinute = minute || "00";
    onChange(`${newHour}:${newMinute}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    const newHour = hour || "00";
    onChange(`${newHour}:${newMinute}`);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Clock className="size-4 text-muted-foreground" />
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder={TIME_UNIT_LABELS.hour} />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map(h => (
            <SelectItem key={h} value={h}>
              {h}
              {TIME_UNIT_LABELS.hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder={TIME_UNIT_LABELS.minute} />
        </SelectTrigger>
        <SelectContent>
          {minutes.map(m => (
            <SelectItem key={m} value={m}>
              {m}
              {TIME_UNIT_LABELS.minute}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
