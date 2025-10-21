"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import { PropsWithChildren } from "react";
import { cn } from "../../lib";
import { Typo } from "./Typo";

interface ButtonTextProps extends PropsWithChildren {
  required?: boolean;
  size?: "medium" | "large";
  leftIcon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  rightIcon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function ButtonText({
  required = false,
  size = "large",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
}: ButtonTextProps) {
  return (
    <div className="flex items-center gap-2 flex-1">
      {LeftIcon && <LeftIcon className="w-6 h-6 shrink-0" />}
      <Typo.ButtonText size={size} className="flex-1 flex gap-0.5">
        {children}
        {required && <span className="text-red-500 font-bold">*</span>}
      </Typo.ButtonText>
      {RightIcon && <RightIcon className="w-6 h-6 shrink-0" />}
    </div>
  );
}

const buttonV2Variants = cva(
  cn(
    "inline-flex items-center justify-center whitespace-nowrap gap-2 rounded-sm transition-colors transition-shadow",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-zinc-800 text-white",
          "hover:bg-zinc-600",
          "active:bg-zinc-950",
          "disabled:bg-zinc-100 disabled:text-zinc-500",
          "focus-visible:ring-zinc-400"
        ),
        secondary: cn(
          "ring-1 ring-inset ring-zinc-200",
          "bg-white text-zinc-950",
          "hover:ring-violet-500 hover:bg-violet-50 hover:text-violet-500",
          "active:ring-violet-500 active:bg-violet-50 active:text-violet-500",
          "disabled:bg-white disabled:text-zinc-200 disabled:ring-zinc-200",
          "focus-visible:ring-violet-400"
        ),
        tertiary: cn(
          "bg-transparent text-zinc-950",
          "hover:bg-zinc-50",
          "active:bg-violet-50 active:text-violet-500",
          "disabled:text-zinc-400 disabled:bg-zinc-100",
          "focus-visible:ring-zinc-300"
        ),
      },
      size: {
        medium: "h-9 px-4",
        large: "h-12 px-3",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "large",
    },
  }
);

export interface ButtonV2Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonV2Variants> {
  ref?: React.Ref<HTMLButtonElement>;
  asChild?: boolean;
  leftIcon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  rightIcon?: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
}

const ButtonV2 = ({
  ref,

  variant,
  size = "large",

  leftIcon,
  rightIcon,
  required = false,
  disabled,

  asChild = false,
  children,
  className,
  ...props
}: ButtonV2Props) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonV2Variants({ variant, size, className }))}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      <ButtonText
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        required={required}
        size={size === "large" ? "large" : "medium"}
      >
        <div className={cn("flex items-center w-full")}>{children}</div>
      </ButtonText>
    </Comp>
  );
};

ButtonV2.displayName = "ButtonV2";

export { ButtonV2, buttonV2Variants };
