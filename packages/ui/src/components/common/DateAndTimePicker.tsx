"use client";

import * as React from "react";
import type { Matcher } from "react-day-picker";
import { ko } from "react-day-picker/locale";
import { cn } from "../../lib/utils";
import { Button as ShadcnButton } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Button } from "./Button";
import { DrawerContent, DrawerProvider, useDrawer } from "./Drawer";
import { TimePicker } from "./TimePicker";
import { Typo } from "./Typo";

interface DateAndTimePickerProps {
  date: Date | undefined;
  /** 시간 값 (HH:mm 형식, 예: "14:30") */
  time: string;
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  /** 선택 불가능한 날짜 (예: { before: new Date() } - 오늘 이전 날짜 비활성화) */
  disabledDates?: Matcher | Matcher[];
}

/**
 *
 * @param time - 시간 값 (HH:mm 형식, 예: "14:30")
 * @returns
 */
export function DateAndTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
  disabledDates,
}: DateAndTimePickerProps) {
  return (
    <div className="flex gap-4">
      {/* Date Picker */}
      <DrawerProvider>
        <DatePickerButton date={date} disabled={disabled} />
        <DrawerContent className="p-5 pb-10">
          <CalendarContent date={date} onDateChange={onDateChange} disabledDates={disabledDates} />
        </DrawerContent>
      </DrawerProvider>

      {/* Time Picker */}
      <DrawerProvider>
        <TimePickerButton time={time} disabled={disabled} />
        <DrawerContent className={cn("p-5 pb-10", "flex flex-col items-center")}>
          <TimePickerContent time={time} onTimeChange={onTimeChange} />
        </DrawerContent>
      </DrawerProvider>
    </div>
  );
}

function DatePickerButton({ date, disabled }: { date: Date | undefined; disabled: boolean }) {
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
        isOpen && "!border-violet-500 bg-violet-50 text-violet-500",
        "shadow-none",
      )}
      disabled={disabled}
    >
      <Typo.ButtonText size="medium">{date ? formatDate(date) : "날짜 선택"}</Typo.ButtonText>
    </ShadcnButton>
  );
}

function TimePickerButton({ time, disabled }: { time: string; disabled: boolean }) {
  const { open, isOpen } = useDrawer();

  const formatTime = (time: string): string => {
    const [h = 0, m = 0] = time.split(":").map(Number);
    const period = h < 12 ? "오전" : "오후";
    const displayHours = h % 12 || 12;
    return `${period} ${String(displayHours).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return (
    <ShadcnButton
      variant="outline"
      onClick={open}
      className={cn(
        "justify-between",
        isOpen && "!border-violet-500 bg-violet-50 text-violet-500",
        "shadow-none",
      )}
      disabled={disabled}
    >
      <Typo.ButtonText size="medium">{formatTime(time)}</Typo.ButtonText>
    </ShadcnButton>
  );
}

function CalendarContent({
  date,
  onDateChange,
  disabledDates,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabledDates?: Matcher | Matcher[];
}) {
  const { close } = useDrawer();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  // date prop이 변경되면 selectedDate도 동기화
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

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
        disabled={disabledDates}
      />
      <Button className="mt-6 w-full" onClick={handleConfirm}>
        확인
      </Button>
    </>
  );
}

function TimePickerContent({
  time,
  onTimeChange,
}: {
  time: string;
  onTimeChange: (time: string) => void;
}) {
  const { close } = useDrawer();
  const [selectedTime, setSelectedTime] = React.useState(time);

  // time prop이 변경되면 selectedTime도 동기화
  React.useEffect(() => {
    setSelectedTime(time);
  }, [time]);

  const handleConfirm = () => {
    onTimeChange(selectedTime);
    close();
  };

  return (
    <>
      <TimePicker value={selectedTime} onValueChange={setSelectedTime} />
      <Button className="mt-6 w-full" onClick={handleConfirm}>
        확인
      </Button>
    </>
  );
}
