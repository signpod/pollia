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

interface TimePickerProps {
  value?: string;
  onChange: (time: string | undefined) => void;
  disabled?: boolean;
  minuteStep?: 1 | 5 | 10 | 15 | 30;
  className?: string;
}

function generateHours(): string[] {
  return Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
}

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
  const hours = generateHours();
  const minutes = generateMinutes(minuteStep);

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
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="시" />
        </SelectTrigger>
        <SelectContent>
          {hours.map(h => (
            <SelectItem key={h} value={h}>
              {h}시
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
        <SelectTrigger className="w-[70px]">
          <SelectValue placeholder="분" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map(m => (
            <SelectItem key={m} value={m}>
              {m}분
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
