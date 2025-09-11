import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap gap-[var(--space-lg)] rounded-[var(--radius-sm)] px-[var(--space-lg)] h-11 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-zinc-800)] text-white hover:bg-[var(--color-zinc-600)] active:bg-[var(--color-zinc-950)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-400)]",
        secondary:
          "bg-white text-[var(--color-zinc-950)] ring-1 ring-[var(--color-zinc-200)] hover:ring-[var(--color-violet-500)] active:ring-[var(--color-zinc-500)] active:bg-[var(--color-violet-50)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-400)] disabled:ring-[var(--color-zinc-200)]",
      },
      isFullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary"
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
      leftIcon?: React.ReactNode;
      rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, isFullWidth = false, leftIcon, rightIcon, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, isFullWidth, className }))}
        ref={ref}
        {...props}
      >
        {leftIcon && <span>{leftIcon}</span>}
        <div className="w-full">
          {children}
        </div>
        {rightIcon && <span>{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
