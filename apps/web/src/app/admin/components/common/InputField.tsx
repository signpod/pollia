"use client";

import { Input } from "@/app/admin/components/shadcn-ui/input";
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { cn } from "@/app/admin/lib/utils";
import type { ComponentProps, ReactNode } from "react";

interface CharacterCounterProps {
  current: number;
  max: number;
}

function CharacterCounter({ current, max }: CharacterCounterProps) {
  const isOver = current > max;
  return (
    <span className={cn("text-xs", isOver ? "text-destructive" : "text-muted-foreground")}>
      {current}/{max}자
    </span>
  );
}

export interface InputFieldProps extends ComponentProps<typeof Input> {
  label?: ReactNode;
  required?: boolean;
  error?: string;
  maxLength?: number;
  showCounter?: boolean;
  currentLength?: number;
  hint?: string;
}

export function InputField({
  label,
  required,
  error,
  maxLength,
  showCounter = false,
  currentLength = 0,
  hint,
  className,
  id,
  ...props
}: InputFieldProps) {
  const showCharacterCounter = showCounter && maxLength !== undefined;

  return (
    <div className="space-y-2">
      {(label || showCharacterCounter) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </Label>
          )}
          {showCharacterCounter && <CharacterCounter current={currentLength} max={maxLength} />}
        </div>
      )}
      <Input id={id} maxLength={maxLength} className={className} {...props} />
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export interface InputWithCounterProps extends ComponentProps<typeof Input> {
  maxLength: number;
  currentLength: number;
}

export function InputWithCounter({
  maxLength,
  currentLength,
  className,
  ...props
}: InputWithCounterProps) {
  return (
    <div className="space-y-1">
      <Input maxLength={maxLength} className={className} {...props} />
      <div className="flex justify-end">
        <CharacterCounter current={currentLength} max={maxLength} />
      </div>
    </div>
  );
}

export { CharacterCounter };
