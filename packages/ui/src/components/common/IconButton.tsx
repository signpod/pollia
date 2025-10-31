"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

type IconComponent = LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconComponent;
  iconClassName?: string;
  className?: string;
}

export function IconButton({
  icon: Icon,
  iconClassName,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex items-center justify-center rounded-sm p-1 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-1",
        "bg-transparent hover:bg-zinc-50 active:bg-zinc-100",
        "disabled:cursor-not-allowed disabled:hover:bg-transparent",
        className,
      )}
      {...props}
    >
      <Icon
        className={cn(
          "size-6 stroke-2 transition-colors duration-300",
          disabled ? "text-zinc-300" : "text-zinc-950",
          disabled || "active:text-zinc-950",
          iconClassName,
        )}
      />
    </button>
  );
}
