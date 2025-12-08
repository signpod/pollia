"use client";
import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";

const Slider = {
  ...SliderPrimitive,
  Dots: SliderDots,
};

export interface RatingScaleOption {
  title?: string;
  order?: number;
}

export type Direction = "horizontal" | "vertical";

export interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  options?: RatingScaleOption[];
  min?: number;
  max?: number;
  step?: number;
  direction?: Direction;
  disabled?: boolean;
}

export function RatingScale({
  value,
  onChange,
  options,
  min = 1,
  max = 5,
  step = 1,
  disabled = false,
  direction = "horizontal",
}: RatingScaleProps) {
  const {
    positions,
    options: sortedOptions,
    sliderMin,
    sliderMax,
    sliderStep,
    isFirst,
    isLast,
    isVertical,
    height,
  } = useMemo(() => {
    if (options && options.length > 0) {
      const sortedOptions = [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const minOrder = sortedOptions[0]?.order ?? 0;
      const maxOrder = sortedOptions[sortedOptions.length - 1]?.order ?? 0;

      const positions: number[] = [];
      const titles: string[] = [];

      sortedOptions.forEach(option => {
        const position =
          maxOrder === minOrder ? 0 : ((option.order ?? 0) - minOrder) / (maxOrder - minOrder);
        positions.push(position);
        titles.push(option.title ?? "");
      });

      const isFirst = (index: number) => index === 0;
      const isLast = (index: number) => index === positions.length - 1;

      const isVertical =
        options.some(option => (option.title?.length ?? 0) > 6) || direction === "vertical";

      const height = isVertical ? options.length * (288 / 5) : undefined;

      return {
        positions,
        options: sortedOptions,
        sliderMin: minOrder,
        sliderMax: maxOrder,
        sliderStep: 1,
        isFirst,
        isLast,
        isVertical,
        height,
      };
    }

    const positions: number[] = [];
    const values: number[] = [];
    for (let i = min; i <= max; i += step) {
      positions.push((i - min) / (max - min));
      values.push(i);
    }

    const isFirst = (index: number) => index === 0;
    const isLast = (index: number) => index === positions.length - 1;
    const isVertical = direction === "vertical";

    return {
      positions,
      options: undefined,
      sliderMin: min,
      sliderMax: max,
      sliderStep: step,
      isFirst,
      isLast,
      isVertical,
      height: undefined,
    };
  }, [options, min, max, step, direction, options?.length]);

  const [localValue, setLocalValue] = useState(Math.max(sliderMin, Math.min(sliderMax, value)));

  const currentIndex = useMemo(() => {
    if (positions.length === 0) return 0;

    if (sortedOptions && sortedOptions.length > 0) {
      const exactIndex = sortedOptions.findIndex(option => option.order === localValue);
      if (exactIndex >= 0) {
        return exactIndex;
      }
      const normalizedValue =
        sliderMax === sliderMin ? 0 : (localValue - sliderMin) / (sliderMax - sliderMin);
      let closestIndex = 0;
      let closestDistance = Math.abs(positions[0] ?? 0 - normalizedValue);
      for (let idx = 1; idx < positions.length; idx++) {
        const distance = Math.abs(positions[idx] ?? 0 - normalizedValue);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = idx;
        }
      }
      return closestIndex;
    }

    const normalizedValue =
      sliderMax === sliderMin ? 0 : (localValue - sliderMin) / (sliderMax - sliderMin);
    let closestIndex = 0;
    let closestDistance = Math.abs(positions[0] ?? 0 - normalizedValue);
    for (let idx = 1; idx < positions.length; idx++) {
      const distance = Math.abs(positions[idx] ?? 0 - normalizedValue);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = idx;
      }
    }
    return closestIndex;
  }, [localValue, sortedOptions, positions, sliderMin, sliderMax]);

  const thumbPosition = useMemo(() => {
    if (positions.length === 0) {
      return {
        left: "0%",
        transform: "translate(0%, -50%)",
        top: "50%",
        position: "absolute" as const,
      };
    }

    const currentPosition = positions[currentIndex] ?? 0;
    const isFirstDot = isFirst(currentIndex);
    const isLastDot = isLast(currentIndex);

    if (isVertical) {
      const top = `${currentPosition * 100}%`;
      const transform = isFirstDot
        ? "translate(-50%, 0%)"
        : isLastDot
          ? "translate(-50%, -100%)"
          : "translate(-50%, -50%)";
      return { top, transform, left: "50%", position: "absolute" as const };
    }

    const left = `${currentPosition * 100}%`;
    const transform = isFirstDot
      ? "translate(0%, -50%)"
      : isLastDot
        ? "translate(-100%, -50%)"
        : "translate(-50%, -50%)";
    return { left, transform, top: "50%", position: "absolute" as const };
  }, [currentIndex, positions, isFirst, isLast, isVertical]);

  return (
    <div className={cn("flex gap-5", isVertical ? "flex-row h-full" : "flex-col w-full")}>
      <div
        className={cn("relative", isVertical ? "px-4 py-9" : "w-full px-9 py-10")}
        style={isVertical && height ? { height: `${height}px` } : undefined}
      >
        <Slider.Root
          value={[localValue]}
          onValueChange={values => {
            const newValue = values[0];
            if (newValue !== undefined) {
              setLocalValue(newValue);
              onChange(newValue);
            }
          }}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          disabled={disabled}
          orientation={isVertical ? "vertical" : "horizontal"}
          className={cn(
            "relative flex touch-none select-none",
            isVertical ? "h-full w-6 flex-col items-center" : "h-18 w-full items-center",
          )}
        >
          <Slider.Track
            className={cn(
              "relative grow overflow-visible rounded-full bg-zinc-100",
              isVertical ? "h-full w-[6px]" : "h-[6px] w-full",
            )}
          />
          <Slider.Dots
            positions={positions}
            options={sortedOptions}
            isFirst={isFirst}
            isLast={isLast}
            isVertical={isVertical}
          />
          <Slider.Thumb
            className={cn(
              "relative block size-9 rounded-full bg-white bg shadow-[0_4px_20px_rgba(0,0,0,0.1)]",
              "focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus-visible:outline-none",
            )}
            style={thumbPosition}
          />
        </Slider.Root>
      </div>
    </div>
  );
}

interface SliderDotsProps {
  positions: number[];
  options?: RatingScaleOption[];
  isFirst: (index: number) => boolean;
  isLast: (index: number) => boolean;
  isVertical: boolean;
}

function SliderDots({ positions, options, isFirst, isLast, isVertical }: SliderDotsProps) {
  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute z-0",
          isVertical
            ? "top-0 bottom-0 left-1/2 flex h-full -translate-x-1/2 flex-col items-center py-0"
            : "left-0 right-0 top-1/2 flex w-full -translate-y-1/2 items-center px-0",
        )}
      >
        {positions.map((position, index) => {
          const isFirstDot = isFirst(index);
          const isLastDot = isLast(index);

          const positionValue = `${position * 100}%`;
          const transform = isVertical
            ? isFirstDot
              ? "translate(-50%, 0%)"
              : isLastDot
                ? "translate(-50%, -100%)"
                : "translate(-50%, -50%)"
            : isFirstDot
              ? "translate(0%, -50%)"
              : isLastDot
                ? "translate(-100%, -50%)"
                : "translate(-50%, -50%)";

          return (
            <div
              key={`dot-${position}`}
              className={cn(
                "flex absolute h-auto items-center justify-center gap-4",
                isVertical ? "flex-row left-1/2" : "flex-col top-1/2",
              )}
              style={
                isVertical ? { top: positionValue, transform } : { left: positionValue, transform }
              }
            >
              <div className="rounded-full transition-colors bg-zinc-200 size-4" />
              {options?.[index]?.title && (
                <Typo.SubTitle
                  size="large"
                  key={`order-${position}`}
                  className={cn(
                    "whitespace-nowrap absolute",
                    isVertical ? "left-[40px]" : "top-[40px]",
                  )}
                >
                  {options?.[index]?.order}점
                </Typo.SubTitle>
              )}
              {options?.[index]?.title && (
                <Typo.Body
                  size="large"
                  key={`title-${position}`}
                  className={cn(
                    "whitespace-nowrap absolute text-sub",
                    isVertical ? "left-[72px]" : "top-[72px]",
                  )}
                >
                  {options?.[index]?.title}
                </Typo.Body>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
