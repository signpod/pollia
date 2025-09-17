"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface DateAndTimePickerProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
}

export function DateAndTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateAndTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-32 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
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
        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
      />
    </div>
  );
}
