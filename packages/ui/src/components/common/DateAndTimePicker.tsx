"use client";

import * as React from "react";
import { Button } from "./Button";
import { Button as ShadcnButton } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Input as ShadcnInput } from "../ui/input";
import { DrawerProvider, DrawerContent, useDrawer } from "./Drawer";
import { cn } from "../../lib/utils";
import { ko } from "react-day-picker/locale";
import { Typo, buttonTextVariants } from "./Typo";

export function DateAndTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
}: DateAndTimePickerProps) {
  return (
    <div className="flex gap-4">
      <DrawerProvider>
        <DatePickerButton date={date} disabled={disabled} />
        <DrawerContent className="p-5 pb-10">
          <CalendarContent date={date} onDateChange={onDateChange} />
        </DrawerContent>
      </DrawerProvider>

      <ShadcnInput
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

interface DateAndTimePickerProps {
  date: Date | undefined;
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
}

function DatePickerButton({
  date,
  disabled,
}: {
  date: Date | undefined;
  disabled: boolean;
}) {
  const { open, isOpen } = useDrawer();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const weekday = date.toLocaleDateString("ko-KR", { weekday: "long" });

    return `${year}.${month}.${day} ${weekday}`;
  };

  return (
    <ShadcnButton
      variant="outline"
      onClick={open}
      className={cn(
        "justify-between",
        isOpen && "text-violet-500 bg-violet-50 !border-violet-500",
        "shadow-none"
      )}
      disabled={disabled}
    >
      <Typo.ButtonText size="medium">
        {date ? formatDate(date) : "날짜 선택"}
      </Typo.ButtonText>
    </ShadcnButton>
  );
}

function CalendarContent({
  date,
  onDateChange,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}) {
  const { close } = useDrawer();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date
  );

  const handleConfirm = () => {
    onDateChange(selectedDate);
    close();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <>
      <Calendar
        mode="single"
        locale={ko}
        selected={selectedDate}
        captionLayout="dropdown"
        onSelect={handleDateSelect}
        className="w-full"
      />
      <Button className="w-full mt-6" onClick={handleConfirm}>
        확인
      </Button>
    </>
  );
}
