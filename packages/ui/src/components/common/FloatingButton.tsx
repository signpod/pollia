"use client";

import { type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib/utils";
import { buttonV2Variants } from "./ButtonV2";

export interface FloatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonV2Variants> {
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const FloatingButton = React.forwardRef<HTMLButtonElement, FloatingButtonProps>(
  ({ icon: Icon, variant, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonV2Variants({ variant }),
          "size-14 rounded-full p-0 shadow-lg",
          "flex items-center justify-center",
          className,
        )}
        {...props}
      >
        <Icon className="h-6 w-6" />
      </button>
    );
  },
);

FloatingButton.displayName = "FloatingButton";

export { FloatingButton };
