import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";
import * as React from "react";
import { cn } from "../../lib";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-sm)] px-[var(--space-lg)] h-12 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-zinc-800)] text-white hover:bg-[var(--color-zinc-600)] active:bg-[var(--color-zinc-950)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)]",
        secondary: cn(
          "bg-white ring-1 ring-[var(--color-zinc-200)] text-[var(--color-zinc-950)]",
          "hover:ring-[var(--color-violet-500)] hover:text-[var(--color-violet-500)]",
          "active:ring-[var(--color-violet-500)] active:bg-[var(--color-violet-50)] active:text-[var(--color-violet-500)]",
          "disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)] disabled:ring-[var(--color-zinc-200)]",
        ),
        ghost:
          "bg-white text-[var(--color-zinc-950)] active:bg-[var(--color-zinc-50)] disabled:bg-[var(--color-zinc-100)] disabled:text-[var(--color-zinc-300)]",
      },
      iconGap: {
        default: "gap-[var(--space-lg)]",
        compact: "gap-2",
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
      iconGap: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  textAlign?: "left" | "center" | "right";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  inlineIcon?: boolean;
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      iconGap,
      fullWidth = false,
      leftIcon,
      rightIcon,
      inlineIcon = false,
      asChild = false,
      children,
      loading = false,
      textAlign = "center",
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, iconGap, fullWidth, loading }), className)}
        ref={ref}
        {...props}
      >
        {leftIcon && !inlineIcon && <span>{leftIcon}</span>}
        <div
          className={cn(
            "flex items-center gap-2",
            !inlineIcon && "w-full",
            textAlign === "left" && "justify-start",
            textAlign === "center" && "justify-center",
            textAlign === "right" && "justify-end",
          )}
        >
          {inlineIcon && leftIcon && <span>{leftIcon}</span>}
          {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : children}
          {inlineIcon && rightIcon && <span>{rightIcon}</span>}
        </div>
        {rightIcon && !inlineIcon && <span>{rightIcon}</span>}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
