"use client";

import * as React from "react";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils";
import { ko } from "react-day-picker/locale";
import { Typo, buttonTextVariants } from "./Typo";

interface DateAndTimePickerProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

export function DateAndTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
}: DateAndTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = date.toLocaleDateString("ko-KR", { weekday: "long" });

    return `${year}.${month}.${day} ${weekday}`;
  };

  return (
    <div className="flex gap-4">
      <Popover
        open={!disabled && open}
        onOpenChange={disabled ? undefined : setOpen}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-between font-normal text-sm",
              open && "text-violet-500 bg-violet-50 !border-violet-500",
              "shadow-none"
            )}
            disabled={disabled}
          >
            <Typo.ButtonText size="medium">
              {date ? formatDate(date) : "날짜 선택"}
            </Typo.ButtonText>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            locale={ko}
            selected={date}
            captionLayout="dropdown"
            onSelect={(selectedDate) => {
              onDateChange(selectedDate);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        step="1"
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-fit bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
          "shadow-none",
          "focus:border-violet-500 focus:text-violet-500 focus:bg-violet-50",
          "active:border-violet-500 active:text-violet-500 active:bg-violet-50",
          buttonTextVariants({ size: "medium" })
        )}
      />
    </div>
  );
}
