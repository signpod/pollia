"use client";

import { cn } from "@/app/admin/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  masked?: boolean;
}

const PIN_KEYS = ["pin-0", "pin-1", "pin-2", "pin-3", "pin-4", "pin-5"] as const;

export function PinInput({
  value,
  onChange,
  disabled = false,
  error = false,
  masked = false,
}: PinInputProps) {
  const { pins, inputRefs, handleChange, handleKeyDown, handlePaste } = usePinInput({
    value,
    onChange,
    disabled,
  });

  return (
    <div className="flex gap-2">
      {pins.map((pin, index) => (
        <input
          key={PIN_KEYS[index]}
          ref={el => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={pin}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-14 text-center rounded-lg border-2 transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
            masked && pin === "*" ? "text-3xl font-bold" : "text-2xl font-semibold",
            error
              ? "border-destructive focus:ring-destructive focus:border-destructive"
              : "border-input",
            disabled ? "bg-muted cursor-not-allowed opacity-50" : "bg-background",
          )}
        />
      ))}
    </div>
  );
}

interface UsePinInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function usePinInput({ value, onChange, disabled = false }: UsePinInputProps) {
  const [pins, setPins] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const digits = value.split("").slice(0, 6);
    const paddedDigits = [...digits, ...Array(6 - digits.length).fill("")];
    setPins(paddedDigits);
  }, [value]);

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (disabled) return;

      if (digit && !/^\d$/.test(digit)) {
        return;
      }

      const newPins = [...pins];
      newPins[index] = digit;
      setPins(newPins);

      const newValue = newPins.join("").replace(/\s/g, "");
      onChange(newValue);

      if (digit && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [disabled, pins, onChange],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !pins[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }

      if (e.key === "ArrowRight" && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [pins],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text");
      const digits = pastedData.replace(/\D/g, "").slice(0, 6);

      if (digits) {
        onChange(digits);
        const lastFilledIndex = Math.min(digits.length - 1, 5);
        inputRefs.current[lastFilledIndex]?.focus();
      }
    },
    [onChange],
  );

  return {
    pins,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
  };
}
