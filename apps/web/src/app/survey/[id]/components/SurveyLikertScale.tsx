"use client";

import { cn } from "@/lib/utils";
import BadFaceIcon from "@public/svgs/face/bad.svg";
import GoodFaceIcon from "@public/svgs/face/good.svg";
import NormalFaceIcon from "@public/svgs/face/normal.svg";
import VeryBadFaceIcon from "@public/svgs/face/very-bad.svg";
import VeryGoodFaceIcon from "@public/svgs/face/very-good.svg";
import { Slider as SliderPrimitive, Tooltip } from "@repo/ui/components";
import * as React from "react";

export interface SurveyLikertScaleProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

const SCALE_GUIDE_ASSETS = {
  1: { icon: VeryBadFaceIcon, label: "전혀 아니다" },
  2: { icon: BadFaceIcon, label: "아니다" },
  3: { icon: NormalFaceIcon, label: "보통이다" },
  4: { icon: GoodFaceIcon, label: "그렇다" },
  5: { icon: VeryGoodFaceIcon, label: "매우 그렇다" },
} as const;

export interface SurveyThumbProps {
  value: number;
  className?: string;
  size?: number;
}

const SurveyThumb = ({ value, className, size = 40 }: SurveyThumbProps) => {
  const id = React.useId();
  const { icon: FaceIcon, label } = SCALE_GUIDE_ASSETS[value as 1 | 2 | 3 | 4 | 5];

  return (
    <div
      data-tooltip-id={`tooltip-${id}`}
      className={cn(
        "flex items-center justify-center text-violet-500",
        "px-2 py-4",
        "bg-violet-500/20 rounded-sm",
        className,
      )}
    >
      <FaceIcon width={size} height={size} />
      <Tooltip id={`tooltip-${id}`} placement="top">
        {label}
      </Tooltip>
    </div>
  );
};

const isSurveyThumb = (child: React.ReactNode): child is React.ReactElement<SurveyThumbProps> => {
  return React.isValidElement(child) && child.type === SurveyThumb;
};

const SurveyLikertScaleBase = ({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  className,
  disabled = false,
  children,
}: SurveyLikertScaleProps) => {
  const normalizedValue = (value - min) / (max - min);

  const dotPositions = React.useMemo(() => {
    const positions: number[] = [];
    for (let i = min; i <= max; i += step) {
      positions.push((i - min) / (max - min));
    }
    return positions;
  }, [min, max, step]);

  const thumbChild = React.Children.toArray(children).find(isSurveyThumb);

  return (
    <div className={cn("flex w-full flex-col gap-5", className)}>
      <div className={cn("relative h-18 w-full px-11")}>
        <SliderPrimitive.Root
          value={[value]}
          onValueChange={values => {
            const newValue = values[0];
            if (newValue !== undefined) {
              onChange(newValue);
            }
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="relative flex h-18 w-full touch-none select-none items-center"
        >
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-100">
            <SliderPrimitive.Range className="absolute h-full bg-violet-500" />
          </SliderPrimitive.Track>

          <div className="pointer-events-none absolute left-0 right-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-between px-0">
            {dotPositions.map((position, index) => {
              const isActive = position <= normalizedValue;
              const isLarge = index === 0 || index === dotPositions.length - 1;
              const key = `dot-${position}-${index}`;

              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-full transition-colors bg-violet-500",
                    isLarge ? "size-3" : "size-2",
                    isActive ? "opacity-100" : "opacity-20",
                  )}
                />
              );
            })}
          </div>

          <SliderPrimitive.Thumb
            className={cn(
              "relative block focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              disabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
              !thumbChild &&
                "size-6 rounded-full bg-violet-500 shadow-lg ring-2 ring-offset-4 ring-violet-500",
            )}
          >
            {thumbChild && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {React.cloneElement(thumbChild, { value })}
              </div>
            )}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    </div>
  );
};

export const SurveyLikertScale = Object.assign(SurveyLikertScaleBase, { Thumb: SurveyThumb });
