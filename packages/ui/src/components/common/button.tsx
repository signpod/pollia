import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";

import { cn } from "../../lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap gap-[var(--space-lg)] rounded-[var(--radius-sm)] px-[var(--space-lg)] h-12 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-zinc-800)] text-white hover:bg-[var(--color-zinc-600)] active:bg-[var(--color-zinc-950)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)]",
        secondary:
          "bg-white text-[var(--color-zinc-950)] ring-1 ring-[var(--color-zinc-200)] hover:ring-[var(--color-violet-500)] active:ring-[var(--color-violet-500)] active:bg-[var(--color-violet-50)] active:text-[var(--color-violet-500)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)] disabled:ring-[var(--color-zinc-200)]",
        ghost:
          "bg-white text-[var(--color-zinc-950)] active:bg-[var(--color-zinc-50)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
      loading: {
        true: "pointer-events-none",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  textAlign?: "left" | "center" | "right";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      fullWidth = false,
      leftIcon,
      rightIcon,
      asChild = false,
      children,
      loading = false,
      textAlign = "center",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, fullWidth, loading, className })
        )}
        ref={ref}
        {...props}
      >
        {leftIcon && <span>{leftIcon}</span>}
        <div
          className={cn(
            "w-full flex items-center",
            textAlign === "left" && "justify-start",
            textAlign === "center" && "justify-center",
            textAlign === "right" && "justify-end"
          )}
        >
          {loading ? (
            <Loader2Icon className="w-4 h-4 animate-spin" />
          ) : (
            children
          )}
        </div>
        {rightIcon && <span>{rightIcon}</span>}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
