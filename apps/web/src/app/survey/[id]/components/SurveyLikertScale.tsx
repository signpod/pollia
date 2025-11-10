"use client";

import { cn } from "@/lib/utils";
import BadFaceIcon from "@public/svgs/face/bad.svg";
import GoodFaceIcon from "@public/svgs/face/good.svg";
import NormalFaceIcon from "@public/svgs/face/normal.svg";
import VeryBadFaceIcon from "@public/svgs/face/very-bad.svg";
import VeryGoodFaceIcon from "@public/svgs/face/very-good.svg";
import { Slider as SliderPrimitive, Typo } from "@repo/ui/components";
import * as React from "react";

export interface ScaleGuideProps {
  labels: string[];
  className?: string;
}

export interface SurveyThumbProps {
  value: number;
  className?: string;
  size?: number;
}

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

type SurveyLikertScaleComponent = React.FC<SurveyLikertScaleProps> & {
  ScaleGuide: React.FC<ScaleGuideProps>;
  Thumb: React.FC<SurveyThumbProps>;
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
          <div className="flex items-center justify-center w-full">
            <Typo.Body size="small" className="whitespace-nowrap text-center">
              {label}
            </Typo.Body>
          </div>
          {index < itemCount - 1 && <div className="h-3 w-0 border-r color-divider-sub" />}
        </React.Fragment>
      ))}
    </div>
  );
};

const SurveyThumb: React.FC<SurveyThumbProps> = ({ value, className, size = 40 }) => {
  const FaceIcon = React.useMemo(() => {
    if (value === 1) return VeryBadFaceIcon;
    if (value === 2) return BadFaceIcon;
    if (value === 3) return NormalFaceIcon;
    if (value === 4) return GoodFaceIcon;
    return VeryGoodFaceIcon;
  }, [value]);

  return (
    <div
      className={cn(
        "flex items-center justify-center text-violet-500",
        "px-2 py-4",
        "bg-violet-500/20 rounded-sm",
        className,
      )}
    >
      <FaceIcon width={size} height={size} />
    </div>
  );
};

const SurveyLikertScaleBase: React.FC<SurveyLikertScaleProps> = ({
  value,
  onChange,
  min = 1,
  max = 5,
  step = 1,
  className,
  disabled = false,
  children,
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

  const stepCount = max - min + 1;

  const hasScaleGuide = React.Children.toArray(children).some(
    child => React.isValidElement(child) && child.type === ScaleGuide,
  );

  React.useEffect(() => {
    if (hasScaleGuide && scaleRef.current) {
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
  }, [hasScaleGuide, stepCount]);

  const scaleGuide = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === ScaleGuide,
  );

  const thumbChild = React.Children.toArray(children).find(
    child => React.isValidElement(child) && child.type === SurveyThumb,
  );

  return (
    <div ref={scaleRef} className={cn("flex w-full flex-col gap-5", className)}>
      {scaleGuide}

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
              !thumbChild &&
                "size-6 rounded-full bg-violet-500 shadow-lg ring-2 ring-offset-4 ring-violet-500",
            )}
          >
            {thumbChild && (
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {React.cloneElement(thumbChild as React.ReactElement<SurveyThumbProps>, { value })}
              </div>
            )}
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    </div>
  );
};

export const SurveyLikertScale = SurveyLikertScaleBase as SurveyLikertScaleComponent;
SurveyLikertScale.ScaleGuide = ScaleGuide;
SurveyLikertScale.Thumb = SurveyThumb;
