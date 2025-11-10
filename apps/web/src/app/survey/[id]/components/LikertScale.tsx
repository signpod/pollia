"use client";

import { cn } from "@/lib/utils";
import { Slider as SliderPrimitive } from "@repo/ui/components";
import * as React from "react";

export interface ScaleThumbProps {
  value: number;
  className?: string;
}

export interface ScaleGuideProps {
  labels: string[];
  className?: string;
}

export interface LikertScaleProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  labels?: string[];
  scaleThumb?: React.ComponentType<ScaleThumbProps>;
  className?: string;
  disabled?: boolean;
}

const DefaultScaleThumb: React.FC<ScaleThumbProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex size-6 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-violet-500",
        className,
      )}
    >
      <div className="size-3 rounded-full bg-violet-500" />
    </div>
  );
};

const ScaleGuide: React.FC<ScaleGuideProps> = ({ labels, className }) => {
  const itemCount = labels.length;

  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between rounded bg-zinc-50 px-2 py-3",
        className,
      )}
    >
      {labels.map((label, index) => (
        <React.Fragment key={`${label}-${index}`}>
          <div className="flex w-15 items-center justify-center">
            <p className="whitespace-nowrap text-center text-xs font-medium leading-[1.5] text-zinc-900">
              {label}
            </p>
          </div>
          {index < itemCount - 1 && <div className="h-3 w-0 border-r border-zinc-200" />}
        </React.Fragment>
      ))}
    </div>
  );
};

export const LikertScale: React.FC<LikertScaleProps> = ({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  labels,
  scaleThumb: ScaleThumbComponent = DefaultScaleThumb,
  className,
  disabled = false,
}) => {
  const scaleRef = React.useRef<HTMLDivElement>(null);
  const [padding, setPadding] = React.useState(0);
  const normalizedValue = (value - min) / (max - min);

  const dotPositions = React.useMemo(() => {
    const positions: number[] = [];
    for (let i = min; i <= max; i += step) {
      positions.push((i - min) / (max - min));
    }
    return positions;
  }, [min, max, step]);

  const hasLabels = labels && labels.length > 0;
  const stepCount = max - min + 1;

  if (hasLabels) {
    if (labels.length !== stepCount) {
      throw new Error("labels의 개수와 step의 개수가 일치하지 않습니다.");
    }
  }

  React.useEffect(() => {
    if (hasLabels && scaleRef.current) {
      const updatePadding = () => {
        if (!scaleRef.current) return;
        const calculatedPadding = scaleRef.current.clientWidth / stepCount / 2;
        setPadding(calculatedPadding);
      };

      updatePadding();

      const resizeObserver = new ResizeObserver(updatePadding);
      resizeObserver.observe(scaleRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }

    setPadding(0);
  }, [hasLabels, stepCount]);

  return (
    <div ref={scaleRef} className={cn("flex w-full flex-col gap-12", className)}>
      {hasLabels && <ScaleGuide labels={labels} />}

      <div
        className={cn("relative h-18 w-full")}
        style={{
          padding: `0px ${padding}px`,
        }}
      >
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
            )}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ScaleThumbComponent value={value} />
            </div>
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    </div>
  );
};
