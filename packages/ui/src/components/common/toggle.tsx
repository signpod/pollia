"use client";

import * as React from "react";
import { cn } from "../../lib";

export interface ToggleProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type"
  > {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ checked, onCheckedChange, disabled, className, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled) {
        onCheckedChange(!checked);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet-500)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-[var(--color-zinc-800)]" : "bg-[var(--color-zinc-200)]",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block size-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5.5" : "translate-x-0.5"
          )}
        />
      </button>
    );
  }
);

Toggle.displayName = "Toggle";

export { Toggle };
