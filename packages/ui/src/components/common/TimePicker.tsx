"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";
import { Typo } from "./Typo";
import { IconButton } from "./IconButton";

import "swiper/css";

export interface TimePickerProps {
  /** 시간 값 (24시간 형식: "HH:mm", 예: "14:30") */
  value?: string;
  /** 시간 변경 콜백 (형식: "HH:mm") */
  onValueChange?: (value: string) => void;
  className?: string;
}

const PERIOD_OPTIONS = [
  { value: "AM", label: "오전" },
  { value: "PM", label: "오후" },
  { value: "AM", label: "오전" },
  { value: "PM", label: "오후" },
] as const;

const convert24To12Hour = (hour24: number): number => {
  const hour12 = hour24 % 12;
  return hour12 === 0 ? 12 : hour12;
};

const convert12To24Hour = (hour12: number, isPM: boolean): number => {
  if (hour12 === 12) return isPM ? 12 : 0;
  return isPM ? hour12 + 12 : hour12;
};

const padZero = (num: number): string => String(num).padStart(2, "0");

const formatTime = (hours: number, minutes: number): string => {
  return `${padZero(hours)}:${padZero(minutes)}`;
};

/**
 * TimePicker
 * @param value - 시간 값 (24시간 형식: "HH:mm", 예: "14:30")
 * @param onValueChange - 시간 변경 콜백 (형식: "HH:mm")
 * @param className - 컴포넌트 클래스 이름
 */
export function TimePicker({
  value = "00:00",
  onValueChange,
  className,
}: TimePickerProps) {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);

  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = String(i + 1).padStart(2, "0");
    return { value: hour, label: hour };
  });

  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const minute = String(i * 5).padStart(2, "0");
    return { value: minute, label: minute };
  });

  const isPM = hours >= 12;
  const currentHour12 = convert24To12Hour(hours);

  const handlePeriodChange = (newPeriod: string) => {
    const newIsPM = newPeriod === "PM";
    const hour24 = convert12To24Hour(currentHour12, newIsPM);
    onValueChange?.(formatTime(hour24, minutes));
  };

  const handleHourChange = (newHour: string) => {
    const hour24 = convert12To24Hour(parseInt(newHour), isPM);
    onValueChange?.(formatTime(hour24, minutes));
  };

  const handleMinuteChange = (newMinute: string) => {
    onValueChange?.(formatTime(hours, parseInt(newMinute)));
  };

  return (
    <div className={cn("flex items-center gap-8", className)}>
      <SwiperPicker
        options={PERIOD_OPTIONS}
        value={isPM ? "PM" : "AM"}
        onChange={handlePeriodChange}
        width="w-12"
      />

      <div className="flex items-center gap-4">
        <SwiperPicker
          options={hourOptions}
          value={padZero(currentHour12)}
          onChange={handleHourChange}
          width="w-10"
        />

        <div className="flex items-center justify-center">
          <Typo.ButtonText size="large" className="text-zinc-950">
            :
          </Typo.ButtonText>
        </div>

        <SwiperPicker
          options={minuteOptions}
          value={padZero(minutes)}
          onChange={handleMinuteChange}
          width="w-10"
        />
      </div>
    </div>
  );
}

interface SwiperPickerProps {
  options: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  width?: string;
}

function SwiperPicker({
  options,
  value,
  onChange,
  width = "w-12",
}: SwiperPickerProps) {
  const [swiperInstance, setSwiperInstance] = React.useState<SwiperType | null>(
    null
  );
  const isInitializedRef = React.useRef(false);

  const currentIndex = options.findIndex((opt) => opt.value === value);

  React.useEffect(() => {
    if (swiperInstance && currentIndex !== -1 && !isInitializedRef.current) {
      swiperInstance.slideToLoop(currentIndex, 0);
      isInitializedRef.current = true;
    }
  }, [swiperInstance, currentIndex]);

  const handleSlideChange = (swiper: SwiperType) => {
    if (isInitializedRef.current) {
      onChange(options[swiper.realIndex]?.value || "");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <IconButton
        icon={ChevronUp}
        onClick={() => swiperInstance?.slidePrev()}
        className="size-12"
        aria-label="이전"
      />
      <div className={cn("h-12 overflow-hidden", width)}>
        <Swiper
          direction="vertical"
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSlideChange}
          className="h-full"
        >
          {options.map((option, index) => (
            <SwiperSlide key={option.value + index}>
              <div className="flex items-center justify-center h-full">
                <Typo.ButtonText size="large">{option.label}</Typo.ButtonText>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <IconButton
        icon={ChevronDown}
        onClick={() => swiperInstance?.slideNext()}
        className="size-12"
        aria-label="다음"
      />
    </div>
  );
}
