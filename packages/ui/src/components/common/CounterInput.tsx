"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "../../lib/utils";
import { IconButton } from "./IconButton";
import { Typo } from "./Typo";

interface CounterInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export function CounterInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false,
}: CounterInputProps) {
  const handleDecrement = React.useCallback(() => {
    if (disabled) return;
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  }, [value, min, step, onChange, disabled]);

  const handleIncrement = React.useCallback(() => {
    if (disabled) return;
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  }, [value, max, step, onChange, disabled]);

  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || value >= max;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* 감소 버튼 */}
      <IconButton
        icon={Minus}
        onClick={handleDecrement}
        disabled={isDecrementDisabled}
        aria-label="감소"
      />

      {/* 값 표시 */}
      <Typo.SubTitle size="large" className="size-6 text-center">
        {value}
      </Typo.SubTitle>

      {/* 증가 버튼 */}
      <IconButton
        icon={Plus}
        onClick={handleIncrement}
        disabled={isIncrementDisabled}
        aria-label="증가"
      />
    </div>
  );
}
