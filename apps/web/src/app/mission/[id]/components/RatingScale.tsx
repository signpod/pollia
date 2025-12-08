"use client";
import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";

interface SliderDotsProps {
  positions: number[];
  options?: RatingScaleOption[];
  isFirst: (index: number) => boolean;
  isLast: (index: number) => boolean;
}

function SliderDots({ positions, options, isFirst, isLast }: SliderDotsProps) {
  return (
    <>
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 items-center px-0 z-0">
        {positions.map((position, index) => {
          const isFirstDot = isFirst(index);
          const isLastDot = isLast(index);

          const left = `${position * 100}%`;
          const transform = isFirstDot
            ? "translate(0%, -50%)"
            : isLastDot
              ? "translate(-100%, -50%)"
              : "translate(-50%, -50%)";

          return (
            <div
              key={`dot-${position}`}
              className="flex flex-col absolute top-1/2 h-auto items-center justify-center gap-4"
              style={{ left, transform }}
            >
              <div className="rounded-full transition-colors bg-zinc-200 size-4" />
              {options?.[index]?.title && (
                <Typo.SubTitle
                  size="large"
                  key={`order-${position}`}
                  className="whitespace-nowrap absolute top-[40px]"
                >
                  {options?.[index]?.order}점
                </Typo.SubTitle>
              )}
              {options?.[index]?.title && (
                <Typo.Body
                  size="large"
                  key={`title-${position}`}
                  className="whitespace-nowrap absolute top-[72px] text-sub"
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

const Slider = {
  ...SliderPrimitive,
  Dots: SliderDots,
};

export interface RatingScaleOption {
  title?: string;
  order?: number;
}

export interface RatingScaleProps {
  value: number;
  onChange: (value: number) => void;
  options?: RatingScaleOption[];
  min?: number;
  max?: number;
  step?: number;
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
}: RatingScaleProps) {
  const {
    positions,
    options: sortedOptions,
    sliderMin,
    sliderMax,
    sliderStep,
    isFirst,
    isLast,
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

      return {
        positions,
        options: sortedOptions,
        sliderMin: minOrder,
        sliderMax: maxOrder,
        sliderStep: 1,
        isFirst,
        isLast,
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

    return {
      positions,
      options: undefined,
      sliderMin: min,
      sliderMax: max,
      sliderStep: step,
      isFirst,
      isLast,
    };
  }, [options, min, max, step]);

  const [localValue, setLocalValue] = useState(Math.max(sliderMin, Math.min(sliderMax, value)));

  return (
    <div className="flex flex-col gap-5  w-full">
      <div className="relative w-full px-9 py-10">
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
          className="relative flex h-18 w-full touch-none select-none items-center"
        >
          <Slider.Track className="relative h-[6px] w-full grow overflow-visible rounded-full bg-zinc-100" />
          <Slider.Dots
            positions={positions}
            options={sortedOptions}
            isFirst={isFirst}
            isLast={isLast}
          />
          <Slider.Thumb
            className={cn(
              "relative block size-9 rounded-full bg-white bg shadow-[0_4px_20px_rgba(0,0,0,0.1)]",
              "focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus-visible:outline-none",
            )}
          />
        </Slider.Root>
      </div>
    </div>
  );
}
