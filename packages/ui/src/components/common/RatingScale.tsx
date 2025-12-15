"use client";
import { Scale, Typo } from "@repo/ui/components";
import { useMemo, useState } from "react";
import type { CSSProperties, ComponentProps } from "react";
import { cn } from "../../lib/utils";

const Slider = {
  Root: Scale.Root,
  Track: Scale.Track,
  Thumb: Scale.Thumb,
  Dots: SliderDots,
};

export interface RatingScaleOption {
  id: string;
  title?: string;
  description?: string;
  order: number;
}

export interface RatingScaleProps extends Omit<
  ComponentProps<"div">,
  "value" | "onChange" | "disabled"
> {
  value: number;
  onChange: (value: number) => void;
  options: RatingScaleOption[];
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
  className,
  ...props
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
      const allHaveOrder = options.every(
        option => option.order !== undefined && option.order !== null,
      );

      let sortedOptions: RatingScaleOption[];
      let positions: number[];
      let sliderMin: number;
      let sliderMax: number;

      if (allHaveOrder) {
        sortedOptions = [...options].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const minOrder = sortedOptions[0]?.order ?? 0;
        const maxOrder = sortedOptions[sortedOptions.length - 1]?.order ?? 0;

        positions = [];

        sortedOptions.forEach(option => {
          const position =
            maxOrder === minOrder ? 0 : ((option.order ?? 0) - minOrder) / (maxOrder - minOrder);
          positions.push(position);
        });

        sliderMin = minOrder;
        sliderMax = maxOrder;
      } else {
        sortedOptions = [...options];
        positions = [];

        sortedOptions.forEach((_, index) => {
          const position = sortedOptions.length === 1 ? 0 : index / (sortedOptions.length - 1);
          positions.push(position);
        });

        sliderMin = 0;
        sliderMax = sortedOptions.length - 1;
      }

      const isFirst = (index: number) => index === 0;
      const isLast = (index: number) => index === positions.length - 1;

      const getTitleLimit = (optionsLength: number) => {
        if (optionsLength >= 5) {
          return 3;
        }
        if (optionsLength >= 4) {
          return 4;
        }
        return 5;
      };

      const isVertical =
        max > 5 ||
        options.length > 5 ||
        options.some(option => (option.description?.toString().length ?? 0) > 0) ||
        options.some(option => (option.title?.trim().length ?? 0) > getTitleLimit(options.length));

      const height = isVertical ? options.length * (288 / 5) : undefined;

      return {
        positions,
        options: sortedOptions,
        sliderMin,
        sliderMax,
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
    const isVertical = max > 5;

    const height = isVertical ? positions.length * (288 / 5) : undefined;

    return {
      positions,
      options: undefined,
      sliderMin: min,
      sliderMax: max,
      sliderStep: step,
      isFirst,
      isLast,
      isVertical,
      height,
    };
  }, [options, min, max, step, options?.length]);

  const [localValue, setLocalValue] = useState(Math.max(sliderMin, Math.min(sliderMax, value)));

  const currentIndex = useMemo(() => {
    if (positions.length === 0) return 0;

    if (sortedOptions && sortedOptions.length > 0) {
      const allHaveOrder = sortedOptions.every(
        option => option.description !== undefined && option.description !== null,
      );

      if (allHaveOrder) {
        const exactIndex = sortedOptions.findIndex(option => option.order === localValue);
        return exactIndex;
      }

      const normalizedValue =
        sliderMax === sliderMin ? 0 : (localValue - sliderMin) / (sliderMax - sliderMin);
      const indexValue = Math.round(normalizedValue * (sortedOptions.length - 1));
      return Math.max(0, Math.min(sortedOptions.length - 1, indexValue));
    }

    const index = Math.round((localValue - sliderMin) / sliderStep);
    return Math.max(0, Math.min(positions.length - 1, index));
  }, [localValue, sortedOptions, positions, sliderMin, sliderMax, sliderStep]);

  const thumbPosition = useMemo(() => {
    if (positions.length === 0) {
      return {
        left: "0%",
        transform: "translate(0%, -50%)",
        top: "50%",
        position: "absolute" as const,
      };
    }

    const normalizedValue =
      sliderMax === sliderMin ? 0 : (localValue - sliderMin) / (sliderMax - sliderMin);
    const positionPercent = normalizedValue * 100;

    const isFirstDot = isFirst(currentIndex);
    const isLastDot = isLast(currentIndex);

    if (isVertical) {
      const transform = isFirstDot
        ? "translate(-50%, 0%)"
        : isLastDot
          ? "translate(-50%, -100%)"
          : `translate(-50%, -${positionPercent}%)`;
      return {
        top: "100%",
        transform,
        left: "50%",
        position: "absolute" as const,
      };
    }

    const transform = "translate(-50%, -50%)";
    return {
      left: `${positionPercent}%`,
      transform,
      top: "50%",
      position: "absolute" as const,
    };
  }, [positions, currentIndex, isFirst, isLast, isVertical, localValue, sliderMin, sliderMax]);

  return (
    <div
      className={cn("flex gap-5", isVertical ? "flex-row h-full" : "flex-col w-full", className)}
      {...props}
    >
      <div
        className={cn("relative", isVertical ? "px-4 py-9" : "w-full px-9 pb-10")}
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
        >
          <Slider.Track
            className={cn(
              isVertical ? "h-full w-[6px]" : "h-[6px] w-full",
            )}
          />
          <Slider.Dots
            positions={positions}
            options={sortedOptions}
            isFirst={isFirst}
            isLast={isLast}
            isVertical={isVertical}
            onOptionClick={value => {
              setLocalValue(value);
              onChange(value);
            }}
            sliderMin={sliderMin}
            sliderMax={sliderMax}
            sliderStep={sliderStep}
            disabled={disabled}
          />
          <Slider.Thumb
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
  onOptionClick?: (value: number) => void;
  sliderMin: number;
  sliderMax: number;
  sliderStep: number;
  disabled?: boolean;
}

function SliderDots({
  positions,
  options,
  isFirst,
  isLast,
  isVertical,
  onOptionClick,
  sliderMin: _sliderMin,
  sliderMax: _sliderMax,
  sliderStep: _sliderStep,
  disabled,
}: SliderDotsProps) {
  const handleOptionClick = (order: number) => {
    if (disabled || !onOptionClick) return;

    if (options && options.length > 0) {
      const allHaveOrder = options.every(
        option => option.order !== undefined && option.order !== null,
      );

      if (allHaveOrder) {
        const option = options.find(option => option.order === order);
        if (option) {
          onOptionClick(option.order ?? 0);
        }
      }
    }
  };
  const getTitleStyle = (optionsLength: number): CSSProperties | undefined => {
    if (isVertical) {
      return undefined;
    }

    if (optionsLength === 5) {
      return { width: "3em" };
    }
    if (optionsLength === 4) {
      return { width: "4em" };
    }
    if (optionsLength === 3) {
      return { width: "6em" };
    }

    return undefined;
  };

  const getTitleClassName = () => {
    if (isVertical) {
      return "left-[40px]";
    }

    return "top-[40px]";
  };

  return (
    <>
      <div
        className={cn(
          "absolute z-0",
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
              {isVertical && (options?.[index]?.title || options?.[index]?.description) && (
                <div className="absolute left-[calc(100%+24px)] flex items-center gap-3">
                  {options?.[index]?.title && (
                    <Typo.SubTitle
                      size="large"
                      key={`title-${position}`}
                      style={{
                        width: "auto",
                        whiteSpace: "nowrap",
                      }}
                      className={cn(
                        onOptionClick && !disabled && "cursor-pointer hover:opacity-70",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                      onClick={() => handleOptionClick(options?.[index]?.order ?? 0)}
                    >
                      {options?.[index]?.title}
                    </Typo.SubTitle>
                  )}
                  {options?.[index]?.description && (
                    <Typo.Body
                      size="large"
                      key={`order-${position}`}
                      className={cn(
                        "whitespace-nowrap text-sub",
                        onOptionClick && !disabled && "cursor-pointer hover:opacity-70",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                      style={{
                        width: "auto",
                      }}
                      onClick={() => handleOptionClick(options?.[index]?.order ?? 0)}
                    >
                      {options?.[index]?.description}
                    </Typo.Body>
                  )}
                </div>
              )}
              <div className="rounded-full transition-colors bg-zinc-200 size-4" />
              {!isVertical && options?.[index]?.title && (
                <Typo.SubTitle
                  size="large"
                  key={`title-horizontal-${position}`}
                  className={cn("absolute text-center pointer-events-auto", getTitleClassName())}
                  style={getTitleStyle(options?.length ?? 0)}
                  onClick={() => handleOptionClick(index)}
                >
                  {options?.[index]?.title}
                </Typo.SubTitle>
              )}
              {!isVertical && options?.[index]?.description && (
                <Typo.Body
                  size="large"
                  key={`order-horizontal-${position}`}
                  className={cn("whitespace-nowrap absolute text-sub", "top-[72px]")}
                >
                  {options?.[index]?.description}
                </Typo.Body>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
