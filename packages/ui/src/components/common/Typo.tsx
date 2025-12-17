import { type VariantProps, cva } from "class-variance-authority";
import React from "react";
import { cn } from "../../lib/utils";

const mainTitleVariants = cva("font-bold leading-[1.5]", {
  variants: {
    size: {
      large: "text-[28px]",
      medium: "text-[24px]",
      small: "text-[20px]",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const subTitleVariants = cva("font-bold leading-[1.5]", {
  variants: {
    size: {
      large: "text-[16px]",
    },
  },
  defaultVariants: {
    size: "large",
  },
});

const bodyVariants = cva("leading-[1.5]", {
  variants: {
    size: {
      large: "text-[16px] font-medium",
      medium: "text-[14px] font-semibold",
      small: "text-[12px] font-medium",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});

const buttonTextVariants = cva("font-bold leading-[1.5]", {
  variants: {
    size: {
      large: "text-[16px]",
      medium: "text-[14px]",
    },
  },
  defaultVariants: {
    size: "large",
  },
});

interface MainTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof mainTitleVariants>,
    React.PropsWithChildren {}

interface SubTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof subTitleVariants>,
    React.PropsWithChildren {}

interface BodyProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof bodyVariants>,
    React.PropsWithChildren {}

interface ButtonTextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof buttonTextVariants>,
    React.PropsWithChildren {}

const MainTitle = React.forwardRef<HTMLHeadingElement, MainTitleProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <h1 className={cn(mainTitleVariants({ size, className }))} ref={ref} {...props}>
        {children}
      </h1>
    );
  },
);
MainTitle.displayName = "MainTitle";

const SubTitle = React.forwardRef<HTMLHeadingElement, SubTitleProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <h2 className={cn(subTitleVariants({ size, className }))} ref={ref} {...props}>
        {children}
      </h2>
    );
  },
);
SubTitle.displayName = "SubTitle";

const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <p className={cn(bodyVariants({ size, className }))} ref={ref} {...props}>
        {children}
      </p>
    );
  },
);
Body.displayName = "Body";

const ButtonText = React.forwardRef<HTMLSpanElement, ButtonTextProps>(
  ({ className, size, children, ...props }, ref) => {
    return (
      <span className={cn(buttonTextVariants({ size, className }))} ref={ref} {...props}>
        {children}
      </span>
    );
  },
);
ButtonText.displayName = "ButtonText";

export const Typo = {
  MainTitle,
  SubTitle,
  Body,
  ButtonText,
};

export { mainTitleVariants, subTitleVariants, bodyVariants, buttonTextVariants };

export type { MainTitleProps, SubTitleProps, BodyProps, ButtonTextProps };
