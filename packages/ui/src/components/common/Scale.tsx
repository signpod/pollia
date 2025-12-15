"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ComponentProps, CSSProperties } from "react";
import { cn } from "../../lib/utils";

export interface ScaleRootProps
  extends Omit<ComponentProps<"div">, "value" | "onChange" | "onValueChange"> {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
}

function ScaleRoot({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  className,
  children,
  ...props
}: ScaleRootProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!rootRef.current) return null;

      const rect = rootRef.current.getBoundingClientRect();
      let percentage: number;

      if (orientation === "vertical") {
        const y = clientY - rect.top;
        percentage = y / rect.height;
      } else {
        const x = clientX - rect.left;
        percentage = x / rect.width;
      }

      percentage = Math.max(0, Math.min(1, percentage));
      const rawValue = min + percentage * (max - min);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, orientation],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      const newValue = getValueFromPosition(e.clientX, e.clientY);
      if (newValue !== null) {
        setDragValue(newValue);
        onValueChange([newValue]);
      }
    },
    [disabled, getValueFromPosition, onValueChange],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || disabled) return;

      const newValue = getValueFromPosition(e.clientX, e.clientY);
      if (newValue !== null && dragValue !== newValue) {
        setDragValue(newValue);
        onValueChange([newValue]);
      }
    },
    [isDragging, disabled, getValueFromPosition, dragValue, onValueChange],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragValue(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);

      const touch = e.touches[0];
      if (!touch) return;
      const newValue = getValueFromPosition(touch.clientX, touch.clientY);
      if (newValue !== null) {
        setDragValue(newValue);
        onValueChange([newValue]);
      }
    },
    [disabled, getValueFromPosition, onValueChange],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || disabled) return;
      e.preventDefault();

      const touch = e.touches[0];
      if (!touch) return;
      const { clientX, clientY } = touch;
      const newValue = getValueFromPosition(clientX, clientY);
      if (newValue !== null && dragValue !== newValue) {
        setDragValue(newValue);
        onValueChange([newValue]);
      }
    },
    [isDragging, disabled, getValueFromPosition, dragValue, onValueChange],
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragValue(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex touch-none select-none",
        orientation === "vertical" ? "flex-col" : "flex-row",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-orientation={orientation}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ScaleTrackProps extends ComponentProps<"div"> {}

function ScaleTrack({ className, children, ...props }: ScaleTrackProps) {
  return (
    <div
      className={cn(
        "relative",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ScaleThumbProps extends ComponentProps<"div"> {
  style?: CSSProperties;
}

function ScaleThumb({ className, style, ...props }: ScaleThumbProps) {
  return (
    <div
      className={cn(
        "absolute",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

export const Scale = {
  Root: ScaleRoot,
  Track: ScaleTrack,
  Thumb: ScaleThumb,
};
