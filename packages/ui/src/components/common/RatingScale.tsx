"use client";

import Check from "@public/svgs/check.svg";
import { Scale, Typo } from "@repo/ui/components";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ComponentProps } from "react";
import { cn } from "../../lib/utils";

const OPTION_HEIGHT = 80;
const MIN_VERTICAL_HEIGHT = 350;

export interface RatingScaleOption {
  id: string;
  title?: string;
  description?: string;
  order: number;
}

export interface RatingScaleProps
  extends Omit<ComponentProps<"div">, "value" | "onChange" | "disabled"> {
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
    shouldStackLabels,
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

      const height = isVertical
        ? Math.max(options.length * OPTION_HEIGHT, MIN_VERTICAL_HEIGHT)
        : undefined;

      const shouldStackLabels =
        isVertical &&
        options.some(option => {
          const titleLength = option.title?.trim().length ?? 0;
          const descriptionLength = option.description?.trim().length ?? 0;
          return titleLength + descriptionLength > 20;
        });

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
        shouldStackLabels,
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

    const height = isVertical
      ? Math.max(positions.length * OPTION_HEIGHT, MIN_VERTICAL_HEIGHT)
      : undefined;

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
      shouldStackLabels: false,
    };
  }, [options, min, max, step, options?.length]);

  const getDefaultValue = () => {
    if (value !== undefined && value >= sliderMin && value <= sliderMax) {
      return value;
    }
    return sliderMin + Math.floor((sliderMax - sliderMin) / 2);
  };

  const [localValue, setLocalValue] = useState(getDefaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (value !== undefined && value >= sliderMin && value <= sliderMax) {
      setLocalValue(value);
    }
  }, [value, sliderMin, sliderMax]);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

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

    if (isVertical) {
      const transform = "translate(-50%, -50%)";
      return {
        top: `${positionPercent}%`,
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
  }, [positions, isVertical, localValue, sliderMin, sliderMax]);

  return (
    <div
      className={cn("flex gap-5", isVertical ? "flex-row h-full" : "flex-col w-full", className)}
      {...props}
    >
      <div
        ref={containerRef}
        className={cn("relative w-full", isVertical ? "px-4 py-9" : "w-full px-9 pb-10")}
        style={isVertical && height ? { height: `${height}px` } : undefined}
      >
        <Scale.Root
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
            isVertical ? "h-full w-6 items-center" : "h-18 w-full items-center",
            "pointer-events-none",
          )}
        >
          <Scale.Track
            className={cn(
              "relative overflow-visible rounded-full bg-violet-100",
              isVertical
                ? "h-full w-[6px] before:-inset-y-[40px] before:-inset-x-[100px]"
                : "h-[6px] w-full grow before:-inset-y-[40px] before:-inset-x-[100px]",
            )}
          />
          <RatingScaleDots
            positions={positions}
            options={sortedOptions}
            isFirst={isFirst}
            isLast={isLast}
            isVertical={isVertical}
            onOptionClick={(value: number) => {
              setLocalValue(value);
              onChange(value);
            }}
            disabled={disabled}
            shouldStackLabels={shouldStackLabels}
            containerWidth={containerWidth}
          />
          <Scale.Thumb
            className={cn(
              "size-9 rounded-full bg-violet-400 shadow-[0_3px_6px_rgba(141,93,249,0.3)] inset-shadow-[0_3px_4px_rgba(141,93,249,0.6)] flex items-center justify-center",
              "focus:outline-none pointer-events-auto",
              "data-[orientation='horizontal']:left-[8px]",
            )}
            style={thumbPosition}
          >
            <Check className="size-5 text-white" />
          </Scale.Thumb>
        </Scale.Root>
      </div>
    </div>
  );
}

interface RatingScaleDotsProps {
  positions: number[];
  options?: RatingScaleOption[];
  isFirst: (index: number) => boolean;
  isLast: (index: number) => boolean;
  isVertical: boolean;
  onOptionClick?: (value: number) => void;
  disabled?: boolean;
  shouldStackLabels?: boolean;
  containerWidth?: number;
}

function RatingScaleDots({
  positions,
  options,
  isVertical,
  onOptionClick,
  disabled,
  shouldStackLabels,
  containerWidth,
}: RatingScaleDotsProps) {
  const handleOptionClick = (order: number) => {
    if (disabled || !onOptionClick) return;

    if (options && options.length > 0) {
      const allHaveOrder = options.every(
        (option: RatingScaleOption) => option.order !== undefined && option.order !== null,
      );

      if (allHaveOrder) {
        const option = options.find((option: RatingScaleOption) => option.order === order);
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
        {positions.map((position: number, index: number) => {
          const positionValue = `${position * 100}%`;
          const transform = "translate(-50%, -50%)";

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
                <div
                  className={cn(
                    "absolute flex h-[80px] min-w-[240px]",
                    shouldStackLabels
                      ? "flex-col justify-center gap-y-1"
                      : "flex-row flex-wrap items-center content-center gap-x-3 gap-y-1",
                  )}
                  style={{
                    left: "calc(100% + 24px)",
                    ...(containerWidth !== undefined
                      ? { width: `calc(${containerWidth}px - 60px)` }
                      : { right: "0px" }),
                  }}
                >
                  {options?.[index]?.title && (
                    <Typo.SubTitle
                      size="large"
                      key={`title-${position}`}
                      className={cn(
                        "shrink-0",
                        onOptionClick && !disabled && "cursor-pointer",
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
                        "text-sub",
                        onOptionClick && !disabled && "cursor-pointer",
                        disabled && "cursor-not-allowed opacity-50",
                      )}
                      onClick={() => handleOptionClick(options?.[index]?.order ?? 0)}
                    >
                      {options?.[index]?.description}
                    </Typo.Body>
                  )}
                </div>
              )}
              <div className="rounded-full transition-colors bg-violet-200 size-4" />
              {!isVertical && options?.[index]?.title && (
                <Typo.SubTitle
                  size="large"
                  key={`title-horizontal-${position}`}
                  className={cn(
                    "absolute text-center pointer-events-auto cursor-pointer",
                    getTitleClassName(),
                  )}
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
                  className={cn("whitespace-nowrap absolute text-sub cursor-pointer", "top-[72px]")}
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
